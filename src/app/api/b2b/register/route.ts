export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { SITE } from "@/lib/site";

/**
 * FÁZA 4 — B2B registrácia (realizačné firmy).
 *
 * Registrácia cez IČO s ručným schválením: žiadosť príde e-mailom na
 * obchod@, účet sa aktivuje manuálne. Login + zobrazovanie priceTrade
 * príde po naplnení veľkoobchodných cien (teraz sú priceTrade: null pre
 * všetky produkty, takže niet čo chrániť ani zobrazovať — trade ceny
 * NIKDY nie sú v klientskom bundli, sú len v serverových dátach).
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

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
    }
    const ip = getClientIp(req.headers);
    const rl = rateLimit({ key: "b2b-register", identifier: ip, limit: 3, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    if (typeof body.website === "string" && body.website.length > 0) {
      return NextResponse.json({ ok: true }); // honeypot
    }

    const firma = typeof body.firma === "string" ? body.firma.trim().slice(0, 200) : "";
    const ico = typeof body.ico === "string" ? body.ico.replace(/\s/g, "") : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (firma.length < 2) {
      return NextResponse.json({ error: "validation", message: "Zadaj názov firmy." }, { status: 400 });
    }
    if (!/^\d{6,8}$/.test(ico)) {
      return NextResponse.json({ error: "validation", message: "Zadaj platné IČO (6–8 číslic)." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "validation", message: "Zadaj platný e-mail." }, { status: 400 });
    }
    if (!/^[+\d\s\-/()]{9,30}$/.test(phone)) {
      return NextResponse.json({ error: "validation", message: "Zadaj platný telefón." }, { status: 400 });
    }

    const turnstile = await verifyTurnstileToken(
      typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
      ip !== "unknown" ? ip : null,
    );
    if (!turnstile.ok) {
      return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? `EPOXIDOVO <noreply@${SITE.domain}>`,
        to: [SITE.contact.email],
        replyTo: email,
        subject: `🏢 B2B registrácia: ${firma} (IČO ${ico})`,
        html: `
          <h2 style="font-family:Arial">Nová B2B žiadosť</h2>
          <p style="font-family:Arial;font-size:14px">
            <strong>${esc(firma)}</strong><br/>
            IČO: ${esc(ico)}<br/>
            ${esc(email)} · ${esc(phone)}
          </p>
          <p style="font-family:Arial;font-size:13px;color:#666">
            Účet aktivuj manuálne po overení firmy (ORSR / FinStat).
          </p>
        `,
      });
    } else {
      console.warn("[b2b] RESEND_API_KEY not set — request NOT delivered");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[b2b] unexpected:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
