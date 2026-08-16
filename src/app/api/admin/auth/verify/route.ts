import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyOtpToken, ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "edge";

/** Overí OTP kód + token a vystaví admin session cookie (30 dní). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { code?: unknown; token?: unknown };
  const code = typeof body.code === "string" ? body.code.replace(/\s/g, "") : "";
  const token = typeof body.token === "string" ? body.token : "";
  if (!/^\d{6}$/.test(code) || !token) {
    return NextResponse.json(
      { ok: false, message: "Zadaj 6-miestny kód z e-mailu." },
      { status: 400 },
    );
  }

  if (!(await verifyOtpToken(token, code))) {
    return NextResponse.json(
      { ok: false, message: "Nesprávny alebo expirovaný kód." },
      { status: 401 },
    );
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
