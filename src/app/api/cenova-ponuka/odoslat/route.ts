export const runtime = "edge";

import { NextResponse, type NextRequest } from "next/server";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/cenova-ponuka/odoslat — odošle vyplnený konfigurátor do NajCRM.
 *
 * CRM (/api/webhook/landing-cp) založí lead, priradí obchodníka kolotočom
 * (len keď zákazník chce telefonát) a o ~5 minút pošle automatickú cenovú
 * ponuku v PDF na mail. Tých 5 minút je zámer — „nech to neni instantne".
 *
 * POISTKA: keď CRM nie je nakonfigurované alebo neodpovie, dopyt NEZAHODÍME
 * — pošleme ho cez /api/lead ako doteraz. Zákazník sa nikdy nesmie dostať
 * do stavu „vyplnil som formulár a nič sa nestalo".
 */

/** Záložná cesta — bežný lead formulár webu (e-mail + DB + pôvodný webhook). */
async function zalozneOdoslanie(
  request: NextRequest,
  b: Record<string, unknown>,
): Promise<Response> {
  const url = new URL("/api/lead", request.url);
  const popis = [
    `Typ podlahy: ${String(b.floor_type ?? "-")}`,
    `Plocha: ${String(b.m2 ?? "-")} m²`,
    b.priestor ? `Priestor: ${String(b.priestor)}` : null,
    b.stav_podkladu ? `Stav podkladu: ${String(b.stav_podkladu)}` : null,
    b.lokalita ? `Lokalita: ${String(b.lokalita)}` : null,
    b.chce_kontakt === false
      ? `Telefonát: NECHCE${b.dovod_nechce ? ` (${String(b.dovod_nechce)})` : ""}`
      : "Telefonát: chce",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      // /api/lead kontroluje Origin — posielame vlastný
      origin: url.origin,
    },
    body: JSON.stringify({
      name: b.name,
      email: b.email,
      phone: b.phone ?? "",
      turnstileToken: b.turnstileToken,
      area: b.m2,
      spaceType: b.priestor ?? "",
      termin: b.termin ?? "",
      message: popis,
      source: "konfigurator_cp",
    }),
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: "odoslanie_zlyhalo" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, lead_id: null, zaloha: true });
}

const CRM_URL = process.env.NAJCRM_BASE_URL ?? "https://app.najcrm.sk";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const floorType = String(body.floor_type ?? "").trim();
  const m2 = Number(body.m2);
  if (!name || !email || !floorType || !isFinite(m2) || m2 <= 0) {
    return NextResponse.json({ ok: false, error: "chybaju_polia" }, { status: 400 });
  }

  // Anti-bot PRED odoslaním kamkoľvek — inak by sa dal endpoint použiť
  // na zaplavenie CRM aj mailu obchodníkov.
  const ts = await verifyTurnstileToken(
    String(body.turnstileToken ?? ""),
    getClientIp(request.headers),
  );
  if (!ts.ok) {
    return NextResponse.json({ ok: false, error: "overenie_zlyhalo" }, { status: 403 });
  }

  const secret = process.env.EPX_PUSH_SECRET ?? process.env.BDSMANAGER_WEBHOOK_SECRET;
  if (!secret) return zalozneOdoslanie(request, body);

  try {
    const res = await fetch(`${CRM_URL}/api/webhook/landing-cp`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-epx-secret": secret },
      body: JSON.stringify({
        name,
        email,
        phone: String(body.phone ?? "").trim() || undefined,
        floor_type: floorType,
        m2,
        priestor: String(body.priestor ?? "").trim() || undefined,
        lokalita: String(body.lokalita ?? "").trim() || undefined,
        termin: String(body.termin ?? "").trim() || undefined,
        stav_podkladu: String(body.stav_podkladu ?? "").trim() || undefined,
        system_code: String(body.system_code ?? "").trim() || undefined,
        hrubka: String(body.hrubka ?? "").trim() || undefined,
        chce_kontakt: body.chce_kontakt !== false,
        dovod_nechce: String(body.dovod_nechce ?? "").trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return zalozneOdoslanie(request, body);
    return NextResponse.json({ ok: true, lead_id: (data as { lead_id?: string })?.lead_id ?? null });
  } catch {
    return zalozneOdoslanie(request, body);
  }
}
