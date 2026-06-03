export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminOrAgent } from "@/lib/auth-helpers";
import { isDbAvailable } from "@/lib/leads";

// Unifikovaný LeadStatus enum — zhoduje sa s Prisma modelom.
// (Predtým bol tu kratší enum, čo blokovalo prechody na CALLED_NO_ANSWER,
//  REALIZED, NOT_INTERESTED z admin UI.)
const PatchSchema = z.object({
  status: z
    .enum([
      "NEW",
      "CALLED_NO_ANSWER",
      "CONTACTED",
      "QUOTED",
      "WON",
      "REALIZED",
      "NOT_INTERESTED",
      "LOST",
    ])
    .optional(),
  notes: z.string().max(5000).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/leads/[id] — update lead status or notes.
 * **ADMIN alebo AGENT** (VIEWER nemôže updatovať).
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const check = await requireAdminOrAgent();
  if (check.error) return check.error;
  if (!isDbAvailable()) {
    return NextResponse.json(
      { error: "db_unavailable", message: "Databáza nie je pripojená." },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;

  try {
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { prisma } = await import("@/lib/prisma");
    const updated = await prisma.lead.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    console.error("[admin lead PATCH]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
