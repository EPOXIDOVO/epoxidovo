export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/users
 * Pridá nového používateľa do User tabuľky (AGENT alebo ADMIN).
 * Žiadne heslo — login je magic-code (OTP) na ich email.
 */
export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  let body: { email?: string; name?: string | null; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Neplatný email" }, { status: 400 });
  }
  const role = body.role === "ADMIN" ? "ADMIN" : "AGENT"; // VIEWER zatiaľ nepoužívame v UI

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Tento email už v systéme je." },
        { status: 409 },
      );
    }
    const user = await prisma.user.create({
      data: {
        email,
        name: body.name?.trim() || null,
        role,
        active: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        emailVerified: true,
      },
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error("[admin.users.POST] db error:", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
