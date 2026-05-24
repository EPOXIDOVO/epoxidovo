export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isDbAvailable } from "@/lib/leads";

const PatchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "WON", "LOST"]).optional(),
  notes: z.string().max(5000).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/leads/[id] — update lead status or notes.
 * Auth required (NextAuth session).
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
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
