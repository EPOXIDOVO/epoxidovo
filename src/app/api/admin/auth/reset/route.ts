import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  consumeResetToken,
  createSession,
  isAdminEmail,
  passwordProblem,
  setPassword,
} from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

/**
 * POST /api/admin/auth/reset {email, token, password} → nastaví nové heslo
 * a rovno prihlási (session cookie). Token je jednorazový, platí 30 min.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit({
    key: "admin-reset",
    identifier: getClientIp(req.headers),
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "Priveľa pokusov. Skús o pár minút." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    email?: unknown;
    token?: unknown;
    password?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !token || !isAdminEmail(email)) {
    return NextResponse.json(
      { ok: false, message: "Neplatný odkaz. Vyžiadaj si nový cez „Zabudol som heslo”." },
      { status: 400 },
    );
  }
  const pwProblem = passwordProblem(password);
  if (pwProblem) {
    return NextResponse.json({ ok: false, message: pwProblem }, { status: 400 });
  }

  if (!(await consumeResetToken(email, token))) {
    return NextResponse.json(
      { ok: false, message: "Odkaz je neplatný alebo expirovaný. Vyžiadaj si nový." },
      { status: 401 },
    );
  }

  await setPassword(email, password);

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
