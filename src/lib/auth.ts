import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend as ResendSdk } from "resend";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";

/**
 * NextAuth v5 — Resend OTP (6-digit code) namiesto magic linku.
 *
 * Authorization model:
 *   - Email v ADMIN_EMAILS env premennej  → automaticky ADMIN role (bootstrap)
 *   - Iný email                            → musí existovať v User tabuľke s active=true
 *
 * Roles:
 *   - ADMIN  → /admin (full) + /leady
 *   - AGENT  → iba /leady (call agent dashboard)
 *   - VIEWER → readonly (rezervované)
 *
 * Required env:
 *   AUTH_SECRET      - random 32+ char string
 *   AUTH_RESEND_KEY  - Resend API kľúč
 *   ADMIN_EMAILS     - comma-separated list of bootstrap admin emails
 *   DATABASE_URL     - Postgres connection string
 */

const adminEmails = (process.env.ADMIN_EMAILS ?? SITE.contact.email)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? `EPOXIDOVO Lead Software <noreply@${SITE.domain}>`;

/** 6-ciferný OTP kód (100000-999999) */
function generateOtpCode(): string {
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
      maxAge: 10 * 60,
      generateVerificationToken: generateOtpCode,
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
    signIn: "/leady/login", // default sign-in stránka (agent flow)
    verifyRequest: "/leady/login?check=email",
    error: "/leady/login?error=auth",
  },
  session: { strategy: "database" },
  callbacks: {
    /**
     * Authorization check:
     *  - Bootstrap admin emails (ADMIN_EMAILS env) → vždy prejdú, ich rola sa automaticky nastaví na ADMIN
     *  - Inak: musia existovať v User tabuľke s active=true
     */
    async signIn({ user }) {
      const email = (user.email ?? "").toLowerCase();
      if (!email) return false;

      // Bootstrap admin: email v ADMIN_EMAILS → vždy povolený
      if (adminEmails.includes(email)) {
        // Zabezpeč že má rolu ADMIN aj v DB (one-time setup pri prvom logine)
        try {
          await prisma.user.upsert({
            where: { email },
            create: { email, role: "ADMIN", active: true },
            update: { role: "ADMIN", active: true },
          });
        } catch (e) {
          console.error("[auth] bootstrap admin upsert failed:", e);
        }
        return true;
      }

      // Iné emaily: musia byť v User tabuľke a active=true
      try {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) return false; // neexistuje → odmietnuť
        if (!dbUser.active) return false; // deaktivovaný → odmietnuť
        return true;
      } catch (e) {
        console.error("[auth] signIn lookup failed:", e);
        return false;
      }
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Pridáme rolu do session (pre route guards)
        // @ts-expect-error rozšírenie session.user
        session.user.role = user.role;
      }
      return session;
    },
  },
  trustHost: true,
});
