import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminEmail, createOtpToken } from "@/lib/admin-auth";
import { SITE } from "@/lib/site";

export const runtime = "edge";

/**
 * Pošle 6-miestny prihlasovací kód na admin e-mail (ADMIN_EMAILS) a vráti
 * bezstavový podpísaný token (platí 10 min). Kód pozná len schránka,
 * token bez kódu je bezcenný — žiadny stav v DB.
 * V dev bez platného Resend kľúča vráti kód rovno v odpovedi.
 */
export async function POST() {
  const email = adminEmail();
  if (!email) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_EMAILS nie je nastavený." },
      { status: 500 },
    );
  }

  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
  const token = await createOtpToken(code);

  const key = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY;
  const usableKey = key && !key.includes("placeholder") ? key : null;

  if (!usableKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[admin-auth] DEV prihlasovací kód: ${code}`);
      return NextResponse.json({ ok: true, token, devCode: code });
    }
    return NextResponse.json(
      { ok: false, message: "E-mail kľúč nie je nastavený (RESEND_API_KEY)." },
      { status: 500 },
    );
  }

  const resend = new Resend(usableKey);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? `EPOXIDOVO <noreply@${SITE.domain}>`,
    to: email,
    subject: `Prihlasovací kód do adminu: ${code}`,
    text: `Tvoj prihlasovací kód do adminu ${SITE.domain} je: ${code}\n\nPlatí 10 minút. Ak si oň nežiadal, ignoruj tento e-mail.`,
  });
  if (error) {
    console.error("[admin-auth] resend:", error);
    return NextResponse.json(
      { ok: false, message: "Kód sa nepodarilo odoslať — skús znova." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, token });
}
