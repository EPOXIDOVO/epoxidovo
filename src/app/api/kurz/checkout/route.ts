export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { isCardGatewayConfigured, createStripeCheckoutSession } from "@/lib/payments";
import { KURZ } from "@/content/kurz";
import { SITE } from "@/lib/site";

/**
 * POST /api/kurz/checkout — objednávka kurzu (Štandard / PRO) s platbou.
 *
 * Bezpečnosť ako /api/order: Origin check, rate limit, Turnstile, honeypot.
 * CENA SA NIKDY NEBERIE Z KLIENTA — server ju určí z `variant`.
 *
 * Platba:
 *  - "karta"  → Stripe Checkout session (ak je STRIPE_SECRET_KEY), vraciame
 *               redirect URL; potvrdenie rieši /api/order/stripe-webhook.
 *  - "prevod" → objednávka prijatá, platobné údaje pošleme e-mailom
 *               (faktúru vystavuje obchod ručne — rovnako ako v e-shope).
 *  - "firma"  → nie je nákup, iba dopyt (3+ ľudí, súkromný termín).
 *
 * Každá objednávka sa zároveň uloží ako Lead (source kurz_checkout) a pošle
 * sa notifikácia obchod@ + potvrdenie zákazníkovi (Resend), aby sa nič
 * nestratilo ani keď Stripe/DB vypadnú.
 *
 * GET /api/kurz/checkout — klient sa pýta, ktoré platobné metódy sú živé.
 */

const MAX_BODY = 32 * 1024;
const ALLOWED_HOSTS = new Set(["epoxidovo.sk", "www.epoxidovo.sk", "localhost", "127.0.0.1"]);

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_HOSTS.has(host) || host.endsWith(".epoxidovo.sk") || host.endsWith(".epoxidovo.pages.dev");
  } catch {
    return false;
  }
}

const Body = z.object({
  name: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  email: z.string().email().max(200),
  phone: z.string().min(9).max(30).regex(/^[+\d\s\-/()]+$/),
  term: z.string().min(3).max(80),
  variant: z.enum(["standard", "pro", "firma"]),
  experience: z.string().max(40).optional(),
  message: z.string().max(2000).optional().or(z.literal("")),
  payment: z.enum(["karta", "prevod"]).default("prevod"),
  locale: z.enum(["sk", "en"]).default("sk"),
  company: z.string().max(200).optional().or(z.literal("")),
  ico: z.string().max(20).optional().or(z.literal("")),
  consent: z.literal(true),
  website: z.string().max(0).optional().or(z.literal("")),
  turnstileToken: z.string().max(2048).optional(),
});

const PRICE: Record<"standard" | "pro", number> = {
  standard: KURZ.priceStandard,
  pro: KURZ.pricePro,
};
const LABEL: Record<"standard" | "pro" | "firma", string> = {
  standard: "Kurz epoxidových podláh — Štandard",
  pro: "Kurz epoxidových podláh — PRO + štartovací balík",
  firma: "Firemné školenie (dopyt)",
};

function orderNumber(): string {
  // KURZ-YYMMDD-XXXX — čitateľné, unikátne dosť na objem kurzov
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, "");
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KURZ-${ymd}-${rnd}`;
}

export async function GET() {
  return NextResponse.json({
    methods: [
      { id: "prevod", available: true },
      { id: "karta", available: isCardGatewayConfigured() },
    ],
    prices: PRICE,
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
    }
    const ip = getClientIp(req.headers);
    const rl = rateLimit({ key: "kurz-checkout", identifier: ip, limit: 6, windowMs: 20 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", message: "Príliš veľa pokusov. Skús o pár minút alebo zavolaj." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
      );
    }
    const raw = await req.text();
    if (raw.length > MAX_BODY) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "validation", details: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;

    // honeypot — tvárime sa, že prešlo
    if (d.website && d.website.length > 0) return NextResponse.json({ ok: true, mode: "ignored" });

    const ts = await verifyTurnstileToken(d.turnstileToken, ip !== "unknown" ? ip : null);
    if (!ts.ok) {
      return NextResponse.json(
        { error: "captcha_failed", message: "Anti-spam overenie zlyhalo. Obnov stránku a skús znova." },
        { status: 403 },
      );
    }
    if (isDisposableEmail(d.email)) {
      return NextResponse.json(
        { error: "disposable_email", message: "Použi prosím svoj reálny e-mail." },
        { status: 400 },
      );
    }

    const fullName = `${d.name.trim()} ${d.lastName.trim()}`.trim();
    const email = d.email.trim().toLowerCase();
    const isPurchase = d.variant !== "firma";
    const amount = isPurchase ? PRICE[d.variant as "standard" | "pro"] : 0;
    const order = isPurchase ? orderNumber() : null;
    const payment = isPurchase ? d.payment : null;

    // Platba kartou vyžaduje bránu — ak nie je, povieme klientovi, nech ponúkne prevod.
    if (isPurchase && payment === "karta" && !isCardGatewayConfigured()) {
      return NextResponse.json(
        { error: "gateway_unavailable", message: "Platba kartou momentálne nie je dostupná — vyber bankový prevod." },
        { status: 503 },
      );
    }

    // Správa do CRM / e-mailu — všetko na jednom mieste
    const lines = [
      isPurchase ? `OBJEDNÁVKA KURZU ${order}` : "DOPYT — FIREMNÉ ŠKOLENIE",
      `Balík: ${LABEL[d.variant]}${isPurchase ? ` — ${amount} €` : ""}`,
      `Termín: ${d.term}`,
      d.experience ? `Skúsenosti: ${d.experience}` : null,
      isPurchase ? `Platba: ${payment === "karta" ? "kartou (Stripe)" : "bankový prevod — poslať platobné údaje"}` : null,
      d.company ? `Firma: ${d.company}${d.ico ? ` (IČO ${d.ico})` : ""}` : null,
      d.message?.trim() ? `\nPoznámka: ${d.message.trim()}` : null,
      `Jazyk stránky: ${d.locale}`,
    ].filter(Boolean).join("\n");

    const leadData = {
      name: fullName,
      email,
      phone: d.phone.trim(),
      spaceType: null,
      service: null,
      area: null,
      message: lines,
      termin: null,
      source: isPurchase ? "kurz_checkout" : "kurz_firma",
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      userAgent: req.headers.get("user-agent"),
      referrer: req.headers.get("referer"),
    };

    // 1) DB
    let leadId: string | null = null;
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const lead = await prisma.lead.create({ data: leadData });
        leadId = lead.id;
      } catch (e) {
        console.error("[kurz] DB save failed:", e);
      }
    }
    // 2) E-maily (obchod@ + zákazník)
    if (process.env.RESEND_API_KEY) {
      try {
        const { sendLeadEmails } = await import("@/lib/email");
        await sendLeadEmails({ ...leadData, source: leadData.source });
      } catch (e) {
        console.error("[kurz] email failed:", e);
      }
    }
    // 3) CRM webhook (best-effort)
    if (process.env.BDSMANAGER_WEBHOOK_URL) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        await fetch(process.env.BDSMANAGER_WEBHOOK_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(process.env.BDSMANAGER_WEBHOOK_SECRET && { "X-Webhook-Secret": process.env.BDSMANAGER_WEBHOOK_SECRET }),
          },
          body: JSON.stringify({
            name: fullName,
            email,
            phone: d.phone.trim(),
            source_campaign: isPurchase ? "Kurz — objednávka (epoxidovo.sk/kurz)" : "Kurz — firemné školenie",
            priority: "high",
            data: { message: lines, order, amount: amount || undefined, payment: payment ?? undefined },
          }),
        }).finally(() => clearTimeout(t));
      } catch (e) {
        console.error("[kurz] CRM forward failed:", e);
      }
    }

    if (!isPurchase) {
      return NextResponse.json({ ok: true, mode: "inquiry", id: leadId });
    }

    const base = `${SITE.url}`;
    const thanksPath = d.locale === "sk" ? "/kurz/dakujeme" : "/en/epoxy-flooring-course/thank-you";

    if (payment === "karta") {
      const origin = req.headers.get("origin") ?? base;
      const session = await createStripeCheckoutSession({
        orderId: order!,
        amountEur: amount,
        customerEmail: email,
        description: `${LABEL[d.variant]} · ${d.term}`,
        successUrl: `${origin}${thanksPath}?o=${order}&p=karta&s={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}${d.locale === "sk" ? "/kurz" : "/en/epoxy-flooring-course"}#prihlaska`,
      });
      return NextResponse.json({ ok: true, mode: "redirect", order, url: session.url });
    }

    return NextResponse.json({
      ok: true,
      mode: "prevod",
      order,
      amount,
      redirect: `${thanksPath}?o=${order}&p=prevod&a=${amount}`,
    });
  } catch (e) {
    console.error("[kurz] checkout error:", e);
    return NextResponse.json(
      { error: "server_error", message: "Objednávku sa nepodarilo spracovať. Skús znova alebo zavolaj." },
      { status: 500 },
    );
  }
}
