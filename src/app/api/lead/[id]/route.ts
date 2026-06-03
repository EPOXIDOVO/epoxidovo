export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrAgent } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@prisma/client";

const VALID_STATUSES: LeadStatus[] = [
  "NEW",
  "CALLED_NO_ANSWER",
  "CONTACTED",
  "QUOTED",
  "WON",
  "REALIZED",
  "NOT_INTERESTED",
  "LOST",
];

/**
 * PATCH /api/lead/[id]
 * Update lead status / notes / failedCallCount.
 * Vyžaduje autentifikovaného používateľa (ADMIN alebo AGENT).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const check = await requireAdminOrAgent();
  if (check.error) return check.error;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  let body: {
    status?: string;
    notes?: string;
    failedCallCount?: number;
    nextCallAt?: string | null;
    lastCallAt?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const data: {
    status?: LeadStatus;
    notes?: string | null;
    failedCallCount?: number;
    lastStatusChangeAt?: Date;
    nextCallAt?: Date | null;
    lastCallAt?: Date | null;
  } = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    data.status = body.status as LeadStatus;
    data.lastStatusChangeAt = new Date();
    // Pri zmene statusu na CONTACTED/QUOTED/WON/REALIZED/NOT_INTERESTED/LOST
    // už nemá zmysel zachovávať nextCallAt — resetujeme. Pokiaľ klient explicitne
    // posiela vlastné nextCallAt, použije sa to (handled nižšie).
    if (
      body.nextCallAt === undefined &&
      data.status !== "NEW" &&
      data.status !== "CALLED_NO_ANSWER"
    ) {
      data.nextCallAt = null;
    }
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") {
      return NextResponse.json({ error: "invalid_notes" }, { status: 400 });
    }
    if (body.notes.length > 5000) {
      return NextResponse.json(
        { error: "notes_too_long", message: "Poznámky max 5000 znakov." },
        { status: 400 },
      );
    }
    data.notes = body.notes.trim() || null;
  }
  if (typeof body.failedCallCount === "number") {
    data.failedCallCount = Math.max(0, Math.floor(body.failedCallCount));
  }
  if (body.nextCallAt !== undefined) {
    data.nextCallAt = body.nextCallAt ? new Date(body.nextCallAt) : null;
  }
  if (body.lastCallAt !== undefined) {
    data.lastCallAt = body.lastCallAt ? new Date(body.lastCallAt) : null;
  }

  try {
    const updated = await prisma.lead.update({
      where: { id },
      data,
    });
    return NextResponse.json({ ok: true, lead: updated });
  } catch (e) {
    console.error("[lead.PATCH] db error:", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
