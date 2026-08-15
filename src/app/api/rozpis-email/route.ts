export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getSystem } from "@/data/systems";
import { calcSystem, ThicknessError } from "@/lib/calculator";
import { SITE } from "@/lib/site";

/**
 * POST /api/rozpis-email — „Poslať rozpis na e-mail" z kalkulátora.
 *
 * Server prepočíta rozpis nanovo z {systemId, areaM2, reservePct,
 * thicknessMm} — klientov výstup sa nepoužíva. Posiela HTML e-mail
 * (PDF príloha je plánovaný upgrade — na edge runtime zatiaľ bez nej).
 */

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

function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
    }
    const ip = getClientIp(req.headers);
    const rl = rateLimit({ key: "rozpis-email", identifier: ip, limit: 5, windowMs: 20 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      email?: unknown;
      systemId?: unknown;
      areaM2?: unknown;
      reservePct?: unknown;
      thicknessMm?: unknown;
      includeTools?: unknown;
      turnstileToken?: unknown;
    };

    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "validation", message: "Zadaj platný e-mail." },
        { status: 400 },
      );
    }
    const system = getSystem(typeof body.systemId === "string" ? body.systemId : "");
    const areaM2 = typeof body.areaM2 === "number" ? body.areaM2 : 0;
    if (!system || !(areaM2 > 0) || areaM2 > 100000) {
      return NextResponse.json({ error: "validation" }, { status: 400 });
    }

    const turnstile = await verifyTurnstileToken(
      typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
      ip !== "unknown" ? ip : null,
    );
    if (!turnstile.ok) {
      return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
    }

    let calc;
    try {
      calc = calcSystem(system, {
        areaM2,
        reservePct: typeof body.reservePct === "number" ? Math.min(15, Math.max(0, body.reservePct)) : 5,
        thicknessMm: typeof body.thicknessMm === "number" ? body.thicknessMm : undefined,
        includeTools: body.includeTools !== false,
      });
    } catch (e) {
      if (e instanceof ThicknessError) {
        return NextResponse.json({ error: "validation", message: e.message }, { status: 400 });
      }
      throw e;
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[rozpis] RESEND_API_KEY not set");
      return NextResponse.json({ ok: true, mode: "logged" });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    const layerRows = calc.layers
      .map(
        (l, i) => `<tr>
          <td style="padding:6px;border-bottom:1px solid #eee">${i + 1}. ${l.layer.label}<br/>
            <span style="font-size:12px;color:#666">${l.product.name}</span></td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right">
            ${l.need != null ? `${l.need} ${l.product.packUnit}` : "na dopyt"}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:center">
            ${l.packs != null ? `${l.packs} bal.` : "—"}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right">
            ${l.totalPrice != null ? fmt(l.totalPrice) : "na dopyt"}</td>
        </tr>`,
      )
      .join("");
    const toolRows = calc.tools
      .map(
        (t) => `<tr>
          <td style="padding:6px;border-bottom:1px solid #f5f5f5;color:#555">${t.product.name}</td>
          <td style="padding:6px;border-bottom:1px solid #f5f5f5;text-align:right">${t.qty} ks</td>
          <td></td>
          <td style="padding:6px;border-bottom:1px solid #f5f5f5;text-align:right">
            ${t.totalPrice != null ? fmt(t.totalPrice) : "na dopyt"}</td>
        </tr>`,
      )
      .join("");

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? `EPOXIDOVO <noreply@${SITE.domain}>`,
      to: [email],
      replyTo: SITE.contact.email,
      subject: `Rozpis materiálu: ${system.name} — ${areaM2} m² | ${SITE.name}`,
      html: `
        <h2 style="font-family:Arial">${system.name}</h2>
        <p style="font-family:Arial;font-size:14px">
          Plocha ${areaM2} m² · rezerva ${calc.reservePct} %
          ${calc.thicknessMm ? ` · nivelačka ${calc.thicknessMm} mm` : ""}
        </p>
        <table style="width:100%;border-collapse:collapse;font-family:Arial;font-size:14px">
          <tr style="text-align:left;color:#888;font-size:12px">
            <th style="padding:6px">Vrstva / produkt</th><th style="text-align:right">Potreba</th>
            <th>Balenia</th><th style="text-align:right">Cena</th></tr>
          ${layerRows}
          ${toolRows}
        </table>
        <p style="font-family:Arial;font-size:16px">
          <strong>${calc.priceIsFinal ? "Spolu" : "Medzisúčet"}: ${fmt(calc.priceSubtotal)}</strong>
          ${calc.pricePerM2 != null ? ` (${fmt(calc.pricePerM2)}/m²)` : ""}
        </p>
        ${!calc.priceIsFinal ? `<p style="font-family:Arial;font-size:13px;color:#b45309">Niektoré položky sú „na dopyt" — cenu doladíme e-mailom.</p>` : ""}
        <p style="font-family:Arial;font-size:12px;color:#888">Dodávateľ nie je platiteľom DPH. Ceny sú konečné.</p>
        <p style="font-family:Arial;font-size:14px;background:#eff6ff;padding:10px;border-radius:8px">
          <strong>Nechcete to robiť sami?</strong> Zavolajte
          <a href="tel:${SITE.contact.phoneRaw}">${SITE.contact.phone}</a> — spravíme to za vás.
        </p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[rozpis] unexpected:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
