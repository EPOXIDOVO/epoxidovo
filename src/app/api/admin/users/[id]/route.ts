export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

/** PATCH /api/admin/users/[id] — toggle active flag (alebo zmeniť rolu) */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await context.params;
  let body: { active?: boolean; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const data: { active?: boolean; role?: "ADMIN" | "AGENT" | "VIEWER" } = {};
  if (typeof body.active === "boolean") data.active = body.active;
  if (body.role === "ADMIN" || body.role === "AGENT" || body.role === "VIEWER") {
    data.role = body.role;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error("[admin.users.PATCH]", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

/** DELETE /api/admin/users/[id] — odstrániť používateľa */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await context.params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin.users.DELETE]", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
