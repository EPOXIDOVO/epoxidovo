export const runtime = "edge";

import { NextResponse } from "next/server";

/**
 * GET /api/cenova-ponuka/cennik — prevedenia a ceny €/m² z NajCRM.
 *
 * Web si ich ťahá, aby na kartách prevedenia nesedela ani jedna cena natvrdo.
 * Kľúč zostáva na serveri.
 */
const CRM_URL = process.env.NAJCRM_BASE_URL ?? "https://app.najcrm.sk";

export async function GET() {
  // EPX_PUSH_SECRET je preferovaný; webhook secret už web v produkcii má,
  // takže naceňovanie funguje aj bez dopĺňania novej premennej.
  const secret = process.env.EPX_PUSH_SECRET ?? process.env.BDSMANAGER_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "cennik_nedostupny" });

  try {
    const res = await fetch(`${CRM_URL}/api/public/cennik`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-epx-secret": secret },
    });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ ok: false, error: "cennik_nedostupny" });
  }
}
