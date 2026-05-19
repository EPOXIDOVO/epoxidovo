import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";

/**
 * NextAuth v5 konfig — magic link cez Resend.
 * Iba povolené emaily (env: ADMIN_EMAILS) môžu prihlásiť do /admin.
 *
 * Required env:
 *   AUTH_SECRET      - random 32+ char string
 *   AUTH_RESEND_KEY  - Resend API kľúč
 *   ADMIN_EMAILS     - comma-separated list, napr. "info@epoxidovo.sk,m@epoxidovo.sk"
 *   DATABASE_URL     - Postgres connection string
 */

const allowedEmails = (process.env.ADMIN_EMAILS ?? SITE.contact.email)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: `EPOXIDOVO Admin <noreply@${SITE.domain}>`,
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
