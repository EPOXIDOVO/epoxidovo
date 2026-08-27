import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSession,
  getPasswordHash,
  isAdminEmail,
  verifyPassword,
} from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

/** POST /api/admin/auth/login {email, password} → admin session cookie. */
export async function POST(req: NextRequest) {
  const rl = rateLimit({
    key: "admin-login",
    identifier: getClientIp(req.headers),
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "Priveľa pokusov. Skús o pár minút." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Zadaj e-mail aj heslo." }, { status: 400 });
  }

  // Neprezradíme, či e-mail je admin — rovnaká hláška pri zlom e-maile aj hesle.
  if (!isAdminEmail(email)) {
    return NextResponse.json({ ok: false, message: "Nesprávny e-mail alebo heslo." }, { status: 401 });
  }

  const stored = await getPasswordHash(email);
  if (!stored) {
    // Heslo ešte nie je nastavené → nasmeruj na „Zabudol som heslo".
    return NextResponse.json(
      { ok: false, code: "no_password", message: "Heslo ešte nie je nastavené — použi „Zabudol som heslo”." },
      { status: 409 },
    );
  }

  if (!(await verifyPassword(password, stored))) {
    return NextResponse.json({ ok: false, message: "Nesprávny e-mail alebo heslo." }, { status: 401 });
  }

  const session = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  return res;
}
