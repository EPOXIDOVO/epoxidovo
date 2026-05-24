export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  // @ts-expect-error session.user.role
  const role: string | undefined = session.user.role;
  if (role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return { session };
}

/** POST /api/admin/invoices — vytvorí novú faktúru */
export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  let body: {
    customerName?: string;
    customerEmail?: string;
    amount?: number;
    number?: string;
    description?: string;
    leadId?: string | null;
    dueAt?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const customerName = (body.customerName ?? "").trim();
  if (!customerName) {
    return NextResponse.json(
      { error: "Meno zákazníka je povinné" },
      { status: 400 },
    );
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json(
      { error: "Suma musí byť kladné číslo" },
      { status: 400 },
    );
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
        customerName,
        customerEmail: body.customerEmail?.trim() || null,
        amount: body.amount,
        number: body.number?.trim() || null,
        description: body.description?.trim() || null,
        leadId: body.leadId || null,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
      },
      include: { lead: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({
      ok: true,
      invoice: {
        ...invoice,
        amount: Number(invoice.amount),
        issuedAt: invoice.issuedAt.toISOString(),
        dueAt: invoice.dueAt?.toISOString() ?? null,
        paidAt: invoice.paidAt?.toISOString() ?? null,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[admin.invoices.POST]", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
