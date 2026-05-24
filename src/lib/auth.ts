import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend as ResendSdk } from "resend";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";

/**
 * NextAuth v5 — Resend OTP (6-ciferný kód) namiesto magic linku.
 *
 * Bezpečný + jednoduchý setup:
 *   - PrismaAdapter sa stará o ukladanie User + VerificationToken
 *   - Session strategy = JWT (cookie, stateless) — eliminuje problémy
 *     s databázovou session pri Netlify edge proxy / deploy preview URL
 *   - Cookie config explicitne `secure: true, sameSite: lax, path: /`
 *     aby fungoval konzistentne medzi epoxidovo.sk a netlify subdoménou
 *
 * Authorization:
 *   - Email v ADMIN_EMAILS env  → automaticky ADMIN role + upsert
 *   - Iný email                  → musí existovať v User tabuľke s active=true
 *
 * Required env:
 *   AUTH_SECRET      - random 32+ char string (povinné pre JWT signing)
 *   AUTH_RESEND_KEY  - Resend API kľúč
 *   AUTH_URL         - https://epoxidovo.sk (povinné, inak NextAuth použije
 *                       netlify subdoménu a cookie sa nepošle na epoxidovo.sk)
 *   ADMIN_EMAILS     - comma-separated list of bootstrap admin emails
 *   DATABASE_URL     - Postgres connection string
 */

const adminEmails = (process.env.ADMIN_EMAILS ?? SITE.contact.email)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? `EPOXIDOVO Lead Software <noreply@${SITE.domain}>`;

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

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
    signIn: "/leady/login",
    verifyRequest: "/leady/login?check=email",
    error: "/leady/login?error=auth",
  },
  // JWT — stateless session cez podpísané cookie. Žiadne race conditions
  // s DB session tabuľkou + funguje konzistentne medzi epoxidovo.sk
  // a netlify deploy preview subdoménou.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 dní
  // Explicitný cookie config — secure + sameSite lax + path /. Tým session cookie
  // pristane na epoxidovo.sk doméne (aj keď NextAuth redirectne cez netlify subdoménu).
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    /**
     * Authorization check pri signIn:
     *  - Bootstrap admin emails → upsert v DB + povoľ
     *  - Inak: musí existovať User row s active=true
     */
    async signIn({ user }) {
      const email = (user.email ?? "").toLowerCase();
      console.log("[auth.signIn] attempt for email:", email);
      if (!email) return false;

      if (adminEmails.includes(email)) {
        try {
          await prisma.user.upsert({
            where: { email },
            create: { email, role: "ADMIN", active: true },
            update: { role: "ADMIN", active: true },
          });
          console.log("[auth.signIn] admin upsert OK");
        } catch (e) {
          console.error("[auth.signIn] bootstrap upsert failed:", e);
        }
        return true;
      }

      try {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser || !dbUser.active) {
          console.log("[auth.signIn] rejected:", email);
          return false;
        }
        return true;
      } catch (e) {
        console.error("[auth.signIn] DB lookup failed:", e);
        return false;
      }
    },

    /**
     * JWT callback — beží pri každom token refresh.
     * Sem si "vlepíme" rolu z DB do tokenu, aby ju mali všetky budúce sessiony.
     */
    async jwt({ token, user }) {
      // Pri prvom login `user` parameter prichádza z adaptera (DB User row).
      if (user) {
        const dbUser = user as unknown as { id?: string; role?: string };
        token.id = dbUser.id;
        token.role = dbUser.role;
      }
      // Pri ďalších requestoch user je null. Token uchová ID a role.
      // Pre istotu ak token nemá role (napr. starý token), načítame z DB.
      if (!token.role && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (e) {
          console.error("[auth.jwt] refresh role lookup failed:", e);
        }
      }
      return token;
    },

    /**
     * Session callback — z tokenu (JWT) preposiela id + role do session.user
     */
    async session({ session, token }) {
      if (session.user && token) {
        // @ts-expect-error rozšírenie session.user.id
        session.user.id = token.id as string | undefined;
        // @ts-expect-error rozšírenie session.user.role
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
  trustHost: true,
});
