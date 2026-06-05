export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/visualizer/validate
 *
 * **LEGACY no-op endpoint.** Pôvodne sa tu robil floor pre-check cez Gemini
 * Flash, ale bol príliš striktný a blokoval legit fotky. Necháme to plne
 * na Nano Banana 2 v /generate — ten sám rozhoduje či vie vyrenderovať
 * floor (a ak nie, vráti text response namiesto image, čo detekujeme).
 *
 * Endpoint zostáva aby cached starý JS klient nedostával 404. Vždy vracia ok.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json({ ok: true });
}
