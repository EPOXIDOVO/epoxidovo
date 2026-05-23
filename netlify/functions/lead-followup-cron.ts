import type { Config } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

/**
 * Netlify Scheduled Function — beží každý deň o 09:00 UTC (10:00 SK leto / 11:00 SK zima).
 *
 * Posiela follow-up email leadom ktorí:
 *   1) majú failedCallCount >= 3 (call agent 3× nedovolal)
 *   2) ešte sa neposlal follow-up (followupSentAt IS NULL)
 *   3) status je CALLED_NO_ANSWER (nepokračovali sme s nimi inak)
 *
 * Email povie: "Snažili sme sa vám dovolať, napíšte nám alebo zavolajte späť."
 * Po odoslaní označí followupSentAt = teraz aby sa neposielal opakovane.
 */

const prisma = new PrismaClient();

export default async (req: Request) => {
  const resendKey = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY;
  if (!resendKey) {
    console.error("[cron.followup] RESEND_API_KEY missing");
    return new Response(JSON.stringify({ error: "no_api_key" }), {
      status: 500,
    });
  }

  const resend = new Resend(resendKey);
  const from =
    process.env.EMAIL_FROM ?? "EPOXIDOVO <noreply@epoxidovo.sk>";

  try {
    const now = new Date();
    const leads = await prisma.lead.findMany({
      where: {
        failedCallCount: { gte: 3 },
        followupSentAt: null,
        status: "CALLED_NO_ANSWER",
        // Posielame iba ak uplynul 24h timer po 3. nedovolaní.
        // Tým agent má ešte deň na manuálnu intervenciu predtým ako odíde
        // auto-mail.
        nextCallAt: { lte: now },
      },
      take: 50,
    });

    console.log(`[cron.followup] sending to ${leads.length} leads`);

    const results: Array<{ id: string; email: string; ok: boolean; error?: string }> = [];

    for (const lead of leads) {
      try {
        await resend.emails.send({
          from,
          to: lead.email,
          subject: "Snažili sme sa vám dovolať — EPOXIDOVO",
          html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0a0a0a;">
  <h1 style="font-size:22px;margin:0 0 16px;">Dobrý deň, ${escapeHtml(lead.name.split(" ")[0])},</h1>
  <p style="font-size:15px;line-height:1.6;">
    Posledné dni sme sa vám viackrát pokúšali dovolať na vašom telefónnom čísle
    ohľadom vašej žiadosti o epoxidovú podlahu, ale nepodarilo sa nám
    spojiť. Predpokladáme že nemáte voľnú chvíľu.
  </p>
  <p style="font-size:15px;line-height:1.6;">
    Ak vás ponuka stále zaujíma, prosím <strong>odpovedzte na tento email</strong>
    s vhodným časom, alebo zavolajte priamo na
    <a href="tel:+421948143981" style="color:#1a8cc4;">+421 948 143 981</a>.
  </p>
  <p style="font-size:15px;line-height:1.6;">
    Ak už nemáte záujem, stačí odpovedať jednou vetou — zaradíme si vás
    ako uzavretý dopyt a viac vás kontaktovať nebudeme.
  </p>
  <p style="margin-top:24px;font-size:14px;color:#52525b;">
    Ďakujeme za pochopenie,<br>tím <strong>EPOXIDOVO</strong>
  </p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0 12px;">
  <p style="font-size:11px;color:#a1a1aa;">
    EPOXIDOVO s. r. o. · Plavisko 1956/35, 034 01 Ružomberok ·
    <a href="https://epoxidovo.sk" style="color:#71717a;">epoxidovo.sk</a>
  </p>
</body></html>`,
        });

        await prisma.lead.update({
          where: { id: lead.id },
          data: { followupSentAt: new Date() },
        });

        results.push({ id: lead.id, email: lead.email, ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        console.error(`[cron.followup] ${lead.email} failed:`, msg);
        results.push({ id: lead.id, email: lead.email, ok: false, error: msg });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        sent: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[cron.followup] error:", e);
    return new Response(JSON.stringify({ error: "exception" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const config: Config = {
  // Každý deň o 09:00 UTC (10:00 SK letný čas, 11:00 zimný)
  // https://crontab.guru/#0_9_*_*_*
  schedule: "0 9 * * *",
};
