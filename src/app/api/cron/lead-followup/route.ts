export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

/**
 * Cron endpoint — volaný z Cloudflare Cron Worker každý deň o 9:00 SK.
 *
 * Logika identická s pôvodnou Netlify Scheduled Function:
 *   1) lead.failedCallCount >= 3 (3× nedovolaný)
 *   2) lead.followupSentAt IS NULL (ešte sa neposlal follow-up)
 *   3) lead.status == "CALLED_NO_ANSWER"
 *   4) lead.nextCallAt <= now (24h timer po 3. nedvihnutí uplynul)
 *
 * Bezpečnosť: vyžaduje header `Authorization: Bearer <CRON_SECRET>`.
 * Worker pošle ten secret z svojho prostredia, mimo Cloudflare nikto nevolá.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Konštantný-časový string compare — odolný voči timing attack-om.
 * String equality (a === b) leaky — porovnáva znak po znaku a vráti false
 * pri prvom rozdiele. Atakujúci môže merať response time a postupne
 * uhádnuť každý znak secret-u. Toto compare prejde vždy plný buffer.
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Nie identické dĺžky → vraciame false ale stále urobíme dummy compare
  // aby čas bol porovnateľný so správne dlhým input-om.
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) {
    // Stále urobíme XOR sweep aby čas bol konštantný
    let _dummy = 0;
    for (let i = 0; i < aBytes.length; i++) _dummy |= aBytes[i];
    return false;
  }
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  // 1) Authorization check (timing-safe)
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[cron.followup] CRON_SECRET env var missing");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization") ?? "";
  if (!timingSafeEqual(authHeader, `Bearer ${expected}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2) Resend setup
  const resendKey = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY;
  if (!resendKey) {
    console.error("[cron.followup] RESEND_API_KEY missing");
    return NextResponse.json({ error: "no_api_key" }, { status: 500 });
  }
  const resend = new Resend(resendKey);
  const from = process.env.EMAIL_FROM ?? "EPOXIDOVO <noreply@epoxidovo.sk>";

  // 3) Find leads + send
  try {
    const now = new Date();
    const leads = await prisma.lead.findMany({
      where: {
        failedCallCount: { gte: 3 },
        followupSentAt: null,
        status: "CALLED_NO_ANSWER",
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

    return NextResponse.json({
      ok: true,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (e) {
    // Logujeme detail server-side, ale klientovi nevraciame raw exception message
    // (mohlo by obsahovať DB connection string alebo iné citlivé veci).
    console.error("[cron.followup] error:", e);
    return NextResponse.json({ error: "exception" }, { status: 500 });
  }
}
