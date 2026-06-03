export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrAgent } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";

/**
 * POST /api/lead/[id]/missed-call
 *
 * Rýchla akcia: zaznamenať nedovolaný hovor.
 * Logika:
 *   1× nedvíha → status=CALLED_NO_ANSWER, nextCallAt = teraz + 6h
 *   2× nedvíha → status=CALLED_NO_ANSWER, nextCallAt = teraz + 24h
 *   3× nedvíha → status=CALLED_NO_ANSWER, nextCallAt = null (žiadne ďalšie volanie);
 *                follow-up email sa pošle na ďalší deň cez cron job
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const check = await requireAdminOrAgent();
  if (check.error) return check.error;

  const { id } = await context.params;
  const now = new Date();

  try {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const newCount = existing.failedCallCount + 1;
    let nextCallAt: Date | null;
    if (newCount === 1) {
      // 1× nedvíha → volať znova o 6 hodín
      nextCallAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    } else if (newCount === 2) {
      // 2× nedvíha → volať znova o 24 hodín
      nextCallAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else {
      // 3+ nedvíha → ešte +24h na "3. deň", potom cron pošle follow-up email.
      // (Krátka pauza pred poslaním auto-mailu, aby sa stihla manuálna intervencia.)
      nextCallAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: "CALLED_NO_ANSWER",
        failedCallCount: newCount,
        lastCallAt: now,
        nextCallAt,
        lastStatusChangeAt: now,
      },
    });

    return NextResponse.json({
      ok: true,
      lead: updated,
      message:
        newCount >= 3
          ? `3× nedvíhal — naplánovaný follow-up email cez ${SITE.contact.email}`
          : `${newCount}× nedvíhal — ďalší pokus naplánovaný`,
    });
  } catch (e) {
    console.error("[lead.missed-call] db error:", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
