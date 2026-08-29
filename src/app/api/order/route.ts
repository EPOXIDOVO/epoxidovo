export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getProduct } from "@/data/products";
import { calcWeightKg } from "@/lib/calculator";
import {
  getPaymentMethods,
  getShippingOptions,
  createStripeCheckoutSession,
  type PaymentMethodId,
} from "@/lib/payments";
import { sendOrderEmails, type OrderLineEmail } from "@/lib/order-email";
import { SITE } from "@/lib/site";

/**
 * POST /api/order — odoslanie objednávky z košíka.
 *
 * Bezpečnosť: Origin check, rate limit, Turnstile, honeypot. CENY SA NIKDY
 * NEBERÚ Z KLIENTA — server ich prepočíta z dát podľa productId + qty.
 * Objednávka sa (zatiaľ) neukladá do DB — žije v e-mailoch (obchod@ +
 * zákazník). Pri platbe kartou vracia Stripe redirect URL.
 */

const MAX_BODY = 64 * 1024;
const ALLOWED_HOSTS = new Set(["epoxidovo.sk", "www.epoxidovo.sk", "localhost", "127.0.0.1"]);

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return (
      ALLOWED_HOSTS.has(host) ||
      host.endsWith(".epoxidovo.sk") ||
      host.endsWith(".epoxidovo.pages.dev")
    );
  } catch {
    return false;
  }
}

interface OrderBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  note?: unknown;
  shippingId?: unknown;
  paymentId?: unknown;
  items?: unknown;
  website?: unknown;
  turnstileToken?: unknown;
  consent?: unknown;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
    }
    const ip = getClientIp(req.headers);
    const rl = rateLimit({ key: "order", identifier: ip, limit: 5, windowMs: 20 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", message: "Príliš veľa pokusov — skús o pár minút." },
        { status: 429 },
      );
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }
    let body: OrderBody;
    try {
      body = JSON.parse(raw) as OrderBody;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    // honeypot
    if (typeof body.website === "string" && body.website.length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // validácia
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim().slice(0, 300) : "";
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";
    const shippingId = body.shippingId === "kurier" ? "kurier" : "pickup";
    const paymentIdRaw = typeof body.paymentId === "string" ? body.paymentId : "prevod";

    if (name.length < 3 || !name.includes(" ")) {
      return NextResponse.json(
        { error: "validation", message: "Zadaj meno a priezvisko." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "validation", message: "Zadaj platný e-mail." },
        { status: 400 },
      );
    }
    if (!/^[+\d\s\-/()]{9,30}$/.test(phone)) {
      return NextResponse.json(
        { error: "validation", message: "Zadaj platný telefón." },
        { status: 400 },
      );
    }
    if (body.consent !== true) {
      return NextResponse.json(
        { error: "validation", message: "Chýba súhlas so spracovaním údajov." },
        { status: 400 },
      );
    }
    if (shippingId === "kurier" && address.length < 8) {
      return NextResponse.json(
        { error: "validation", message: "Pre kuriéra zadaj doručovaciu adresu." },
        { status: 400 },
      );
    }

    // Turnstile
    const turnstile = await verifyTurnstileToken(
      typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
      ip !== "unknown" ? ip : null,
    );
    if (!turnstile.ok) {
      return NextResponse.json(
        { error: "captcha_failed", message: "Anti-spam overenie zlyhalo — obnov stránku." },
        { status: 403 },
      );
    }

    // položky — server-side prepočet cien
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 200) {
      return NextResponse.json(
        { error: "validation", message: "Košík je prázdny." },
        { status: 400 },
      );
    }
    const lines: OrderLineEmail[] = [];
    for (const it of body.items as unknown[]) {
      const rec = it as { productId?: unknown; qty?: unknown; color?: unknown; systemLabel?: unknown };
      const productId = typeof rec.productId === "string" ? rec.productId : "";
      const qty = typeof rec.qty === "number" ? Math.floor(rec.qty) : 0;
      const product = getProduct(productId);
      if (!product || qty < 1 || qty > 999) {
        return NextResponse.json(
          { error: "validation", message: `Neplatná položka košíka: ${productId}` },
          { status: 400 },
        );
      }
      lines.push({
        product,
        qty,
        color:
          typeof rec.color === "string" ? rec.color.slice(0, 40) : undefined,
        systemLabel:
          typeof rec.systemLabel === "string" ? rec.systemLabel.slice(0, 80) : undefined,
        lineTotal:
          product.priceRetail != null
            ? Math.round(product.priceRetail * qty * 100) / 100
            : null,
      });
    }

    const subtotal =
      Math.round(lines.reduce((s, l) => s + (l.lineTotal ?? 0), 0) * 100) / 100;
    const hasOnRequest = lines.some((l) => l.lineTotal == null);
    const weightKg = calcWeightKg(
      lines.map((l) => ({
        packSizeKg: l.product.packUnit === "kg" ? l.product.packSize : null,
        qty: l.qty,
      })),
    );
    const containsHazardous = lines.some((l) => l.product.hazardous);
    const shipping = getShippingOptions(weightKg, containsHazardous).find(
      (s) => s.id === shippingId,
    )!;

    const methods = getPaymentMethods();
    const payment = methods.find((m) => m.id === (paymentIdRaw as PaymentMethodId));
    if (!payment) {
      return NextResponse.json(
        { error: "validation", message: "Neplatná platobná metóda." },
        { status: 400 },
      );
    }
    // kartou sa nedá platiť objednávka s položkami na dopyt
    if (payment.id === "karta" && (hasOnRequest || shipping.priceEur == null)) {
      return NextResponse.json(
        {
          error: "validation",
          message:
            "Objednávku s položkami „na dopyt“ alebo nepotvrdenou dopravou nie je možné zaplatiť kartou — vyber prevod alebo dobierku.",
        },
        { status: 400 },
      );
    }

    const orderId = `EPX-${Date.now().toString(36).toUpperCase()}`;
    const total =
      Math.round((subtotal + (shipping.priceEur ?? 0)) * 100) / 100;

    const emailResult = await sendOrderEmails({
      orderId,
      name,
      email,
      phone,
      address: shippingId === "kurier" ? address : null,
      lines,
      subtotal,
      hasOnRequest,
      shippingLabel: shipping.label,
      shippingPrice: shipping.priceEur,
      paymentLabel: payment.label,
      weightKg,
      note: note || null,
    });

    // Štatistiky (/admin/ceny) — best-effort zápis; e-mail je primárny kanál,
    // výpadok DB nesmie objednávku zhodiť.
    let dbOk = false;
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.eshopOrder.create({
        data: {
          id: orderId,
          name,
          email,
          phone,
          subtotalEur: subtotal,
          shippingId,
          paymentId: payment.id,
          hasOnRequest,
          note: note || null,
          items: {
            create: lines.map((l) => ({
              sku: l.product.id,
              nazov: l.product.name,
              qty: l.qty,
              cenaEur: l.product.priceRetail ?? null,
            })),
          },
        },
      });
      dbOk = true;
    } catch (dbErr) {
      console.error("[order] zápis do DB zlyhal (objednávka odišla mailom):", dbErr);
    }

    // Fail-safe (user 2026-08-27): ak zlyhal e-mail AJ DB, objednávka nie je
    // nikde zaznamenaná — NEHLÁSIME úspech (a nepustíme ju na platbu kartou).
    if (!emailResult.sent && !dbOk) {
      console.error("[order] KRITICKÉ: objednávka", orderId, "sa nezaznamenala (e-mail aj DB zlyhali)");
      return NextResponse.json(
        {
          ok: false,
          error:
            "Objednávku sa nepodarilo spracovať. Skúste to prosím znova, alebo nám zavolajte a dokončíme to za vás.",
        },
        { status: 500 },
      );
    }

    // Stripe redirect pri platbe kartou
    if (payment.id === "karta") {
      const session = await createStripeCheckoutSession({
        orderId,
        amountEur: total,
        customerEmail: email,
        description: `Objednávka ${orderId} — materiály EPOXIDOVO (${lines.length} položiek)`,
        successUrl: `${SITE.url}/kupit-material/kosik?stav=zaplatene&objednavka=${orderId}`,
        cancelUrl: `${SITE.url}/kupit-material/kosik?stav=zrusene&objednavka=${orderId}`,
      });
      return NextResponse.json(
        { ok: true, orderId, redirectUrl: session.url },
        { status: 201 },
      );
    }

    return NextResponse.json({ ok: true, orderId }, { status: 201 });
  } catch (err) {
    console.error("[order] unexpected:", err);
    return NextResponse.json(
      { error: "server_error", message: "Niečo sa pokazilo. Skús neskôr alebo zavolaj." },
      { status: 500 },
    );
  }
}
