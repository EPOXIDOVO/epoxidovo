import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminEmail, createResetToken, isAdminEmail } from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/lib/site";

export const runtime = "edge";

/**
 * POST /api/admin/auth/forgot {email} → pošle reset odkaz na admin e-mail.
 * Vždy vráti ok:true (neprezrádza, či je e-mail admin). Odkaz vedie na
 * /admin/ceny?reset=<token>&email=<email> — tam si admin nastaví nové heslo.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit({
    key: "admin-forgot",
    identifier: getClientIp(req.headers),
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "Priveľa pokusov. Skús o pár minút." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  // Neexistujúci / nie-admin e-mail: tvárime sa rovnako (bez odoslania).
  if (!email || !isAdminEmail(email)) {
    return NextResponse.json({ ok: true });
  }

  const raw = await createResetToken(email);
  const base = process.env.AUTH_URL ?? `https://${SITE.domain}`;
  const link = `${base}/admin/ceny?reset=${encodeURIComponent(raw)}&email=${encodeURIComponent(email)}`;

  const key = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY;
  const usableKey = key && !key.includes("placeholder") ? key : null;

  if (!usableKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[admin-auth] DEV reset odkaz: ${link}`);
      return NextResponse.json({ ok: true, devLink: link });
    }
    return NextResponse.json(
      { ok: false, message: "E-mail kľúč nie je nastavený (RESEND_API_KEY)." },
      { status: 500 },
    );
  }

  const resend = new Resend(usableKey);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? `EPOXIDOVO <noreply@${SITE.domain}>`,
    to: adminEmail() ?? email,
    subject: "Nastavenie hesla do adminu",
    text:
      `Klikni na odkaz a nastav si nové heslo do adminu ${SITE.domain}:\n\n${link}\n\n` +
      `Odkaz platí ${30} minút a dá sa použiť raz. Ak si oň nežiadal, ignoruj tento e-mail.`,
  });
  if (error) {
    console.error("[admin-auth] resend forgot:", error);
    return NextResponse.json(
      { ok: false, message: "E-mail sa nepodarilo odoslať — skús znova." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
