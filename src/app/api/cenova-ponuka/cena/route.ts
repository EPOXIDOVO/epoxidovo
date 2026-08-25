export const runtime = "edge";

import { NextResponse, type NextRequest } from "next/server";

import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/cenova-ponuka/cena — orientačná cena pre konfigurátor CP.
 *
 * Nepočítame nič sami. Pýtame sa NajCRM (/api/public/orientacna-cena), ktoré
 * používa presne ten istý vzorec ako automatická CP posielaná do mailu —
 * inak by sa číslo na obrazovke a číslo v PDF rozišlo pri prvej úprave cien
 * v /admin/systems.
 *
 * Kľúč X-Epx-Secret zostáva na serveri, do prehliadača sa nikdy nedostane.
 */

const CRM_URL = process.env.NAJCRM_BASE_URL ?? "https://app.najcrm.sk";

export async function POST(request: NextRequest) {
  const secret = process.env.EPX_PUSH_SECRET ?? process.env.BDSMANAGER_WEBHOOK_SECRET;
  if (!secret) {
    // Bez kľúča cenu nezískame — a NEVYMÝŠĽAME ju. Konfigurátor v takom
    // prípade ukáže „cenu pripravíme individuálne" a dopyt aj tak odošle.
    return NextResponse.json({ ok: false, dovod: "cennik_nedostupny" });
  }

  // Cenník je verejný endpoint — limit, aby sa cezeň nedalo búšiť do CRM.
  const rl = rateLimit({
    key: "cp-cena",
    identifier: getClientIp(request.headers),
    limit: 40,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, dovod: "prilis_vela_poziadaviek" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, dovod: "invalid_json" }, { status: 400 });
  }

  try {
    const res = await fetch(`${CRM_URL}/api/public/orientacna-cena`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-epx-secret": secret },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ ok: false, dovod: "cennik_nedostupny" });
  }
}
