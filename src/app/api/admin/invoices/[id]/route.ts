export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { InvoiceStatus } from "@prisma/client";

const VALID_STATUS: InvoiceStatus[] = [
  "UNPAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

/** PATCH — updatne faktúru (status / paidAt / dueAt / notes / amount …) */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await context.params;
  let body: {
    status?: string;
    paidAt?: string | null;
    dueAt?: string | null;
    customerName?: string;
    customerEmail?: string | null;
    amount?: number;
    description?: string | null;
    number?: string | null;
    notes?: string | null;
    leadId?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status as InvoiceStatus)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.paidAt !== undefined) {
    data.paidAt = body.paidAt ? new Date(body.paidAt) : null;
  }
  if (body.dueAt !== undefined) {
    data.dueAt = body.dueAt ? new Date(body.dueAt) : null;
  }
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (typeof body.amount === "number") data.amount = body.amount;
  if (body.description !== undefined) data.description = body.description;
  if (body.number !== undefined) data.number = body.number;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.leadId !== undefined) data.leadId = body.leadId;

  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data,
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
    console.error("[admin.invoices.PATCH]", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

/** DELETE — zmaže faktúru */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await context.params;
  try {
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin.invoices.DELETE]", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
