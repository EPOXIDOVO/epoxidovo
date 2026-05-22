import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend as ResendSdk } from "resend";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";

/**
 * NextAuth v5 — Resend OTP (6-digit code) namiesto magic linku.
 * Iba povolené emaily (env: ADMIN_EMAILS) môžu prihlásiť do /admin.
 *
 * Flow:
 *   1) Užívateľ zadá email na /admin/login
 *   2) NextAuth vygeneruje 6-ciferný kód, uloží hash do DB (VerificationToken)
 *   3) Resend pošle email s prominentným kódom
 *   4) Užívateľ zadá kód na /admin/login?check=email
 *   5) Form redirectne na /api/auth/callback/resend?token=KOD&email=EMAIL
 *   6) NextAuth overí kód → vytvorí session
 *
 * Required env:
 *   AUTH_SECRET      - random 32+ char string
 *   AUTH_RESEND_KEY  - Resend API kľúč
 *   ADMIN_EMAILS     - comma-separated list
 *   DATABASE_URL     - Postgres connection string
 */

const allowedEmails = (process.env.ADMIN_EMAILS ?? SITE.contact.email)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? `EPOXIDOVO Lead Software <noreply@${SITE.domain}>`;

/** Vygeneruje 6-ciferný OTP kód (cryptographically safe-ish — Math.random je OK pre OTP s 10min TTL) */
function generateOtpCode(): string {
  // 100000-999999 inclusive
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** HTML šablóna emailu s prominentným OTP kódom */
function otpEmailHtml(code: string, email: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #0a0a0a; background: #f8fafc;">
  <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <div style="text-align: center;">
      <div style="font-size: 14px; font-weight: 700; color: #3db6e8; letter-spacing: 0.18em; text-transform: uppercase;">
        EPOXIDOVO LEAD SOFTWARE
      </div>

      <h1 style="font-size: 22px; margin: 24px 0 8px;">Tvoj prihlasovací kód</h1>
      <p style="font-size: 14px; color: #71717a; margin: 0 0 28px;">
        Zadaj tento kód na prihlasovacej stránke. Platí <strong>10 minút</strong>.
      </p>

      <div style="background: #0a0a0a; color: white; border-radius: 12px; padding: 24px; margin: 0 0 28px;">
        <div style="font-size: 42px; font-weight: 700; letter-spacing: 0.4em; font-family: 'SF Mono', 'Consolas', monospace;">
          ${code}
        </div>
      </div>

      <p style="font-size: 12px; color: #a1a1aa; line-height: 1.6; margin: 0;">
        Ak si tento kód nepožiadal/a, ignoruj tento email. Niekto pravdepodobne
        zadal tvoju adresu omylom.
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0 16px;">

    <p style="font-size: 11px; color: #a1a1aa; line-height: 1.5; text-align: center;">
      ${SITE.legalName} • ${SITE.domain}<br>
      Email pre prístup: <strong>${email}</strong>
    </p>
  </div>
</body>
</html>`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: FROM_ADDRESS,
      // OTP TTL — 10 minút (defaultný magic link mal 24h, pre kód treba menej)
      maxAge: 10 * 60,
      // Generuje 6-ciferný kód namiesto dlhého random tokenu
      generateVerificationToken: generateOtpCode,
      // Custom email s prominentným kódom
      sendVerificationRequest: async ({ identifier: email, token, provider }) => {
        const apiKey = (provider as { apiKey?: string }).apiKey;
        if (!apiKey) {
          console.error("[auth] AUTH_RESEND_KEY missing — cannot send OTP");
          return;
        }
        const resend = new ResendSdk(apiKey);
        await resend.emails.send({
          from: FROM_ADDRESS,
          to: email,
          subject: `Prihlasovací kód: ${token}`,
          html: otpEmailHtml(token, email),
        });
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    verifyRequest: "/admin/login?check=email",
    error: "/admin/login?error=auth",
  },
  session: { strategy: "database" },
  callbacks: {
    async signIn({ user }) {
      // Allow only configured admin emails
      const email = (user.email ?? "").toLowerCase();
      return allowedEmails.includes(email);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  trustHost: true,
});
