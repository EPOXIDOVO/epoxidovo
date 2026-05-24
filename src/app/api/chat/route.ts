export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chat — DOČASNE DISABLED.
 *
 * Pôvodne integroval Anthropic SDK (@anthropic-ai/sdk) ktorý vyžaduje Node.js
 * APIs (node:fs, node:path) nedostupné v Cloudflare Workers edge runtime.
 *
 * TODO po deploy:
 *   1) Buď: prepísať na fetch() priamo voči https://api.anthropic.com/v1/messages
 *      (edge-compatible, žiadny SDK)
 *   2) Alebo: vrátiť na nodejs runtime a deploynúť ako separátny Worker
 *
 * Zatiaľ vraciame statickú FAQ odpoveď aby chat widget nebol úplne mŕtvy.
 */

const FAQ_FALLBACK =
  "Ďakujem za otázku! Momentálne náš AI asistent prechádza údržbou. Pre rýchlu " +
  "odpoveď zavolajte +421 948 143 981 alebo vyplňte cenovú ponuku na " +
  "https://epoxidovo.sk/cenova-ponuka — odpovieme do 24 hodín.";

export async function POST(_req: NextRequest) {
  return NextResponse.json({ reply: FAQ_FALLBACK });
}
