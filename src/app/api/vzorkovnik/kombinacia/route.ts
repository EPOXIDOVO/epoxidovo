export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

import { generateFloorEdit, type ReferenceImage } from "@/lib/gemini-image";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIp } from "@/lib/rate-limit";
import { TOPSTONE_METALIK } from "@/content/topstone-metalik";

/**
 * POST /api/vzorkovnik/kombinacia — namieša 2–3 metalické efekty do jednej
 * vzorky. User 2026-08-25: „urob tu taky nejaky tool ze si pridas dve alebo
 * tri vzorkovniky a vyjde ti nova proste kombinacia".
 *
 * Vstupom NIE je nič od používateľa okrem slugov — referenčné fotky sú naše
 * vlastné vzorky TopStone, takže výsledok vychádza z reálnych odtieňov,
 * nie z toho, čo si model vymyslí.
 *
 * Rozpočet: každé volanie stojí ~0,067 €, tak platia tie isté brzdy ako pri
 * vizualizéri — Turnstile, limit na IP a globálny denný strop. Počítadlo je
 * spoločné (tabuľka VisualizerGeneration, texture = "kombinacia").
 */
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const LIMIT_NA_IP = 6;
const GLOBALNY_STROP = 40;

export async function POST(request: NextRequest) {
  if (process.env.VISUALIZER_ENABLED === "false") {
    return NextResponse.json({ ok: false, error: "vypnute" }, { status: 503 });
  }

  let body: { slugy?: unknown; turnstileToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Len naše slugy, 2 alebo 3 — nič iné sa do promptu nedostane.
  const slugy = Array.isArray(body.slugy) ? body.slugy.map(String) : [];
  const efekty = slugy
    .map((s) => TOPSTONE_METALIK.find((e) => e.id === s))
    .filter((e): e is (typeof TOPSTONE_METALIK)[number] => Boolean(e));
  if (efekty.length < 2 || efekty.length > 3 || efekty.length !== slugy.length) {
    return NextResponse.json(
      { ok: false, error: "zly_vyber", message: "Vyber 2 alebo 3 odtiene." },
      { status: 400 },
    );
  }

  const ip = getClientIp(request.headers);
  const ts = await verifyTurnstileToken(String(body.turnstileToken ?? ""), ip);
  if (!ts.ok) {
    return NextResponse.json(
      { ok: false, error: "captcha_failed", message: "Anti-spam overenie zlyhalo." },
      { status: 403 },
    );
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const od = new Date(Date.now() - RATE_WINDOW_MS);
      const [naIp, globalne] = await Promise.all([
        prisma.visualizerGeneration.count({ where: { ip, createdAt: { gte: od }, ok: true } }),
        prisma.visualizerGeneration.count({ where: { createdAt: { gte: od }, ok: true } }),
      ]);
      if (naIp >= LIMIT_NA_IP) {
        return NextResponse.json(
          {
            ok: false,
            error: "rate_limit_ip",
            message: `Dosiahol si denný limit ${LIMIT_NA_IP} miešaní. Skús zajtra.`,
          },
          { status: 429 },
        );
      }
      if (globalne >= GLOBALNY_STROP) {
        return NextResponse.json(
          {
            ok: false,
            error: "rate_limit_global",
            message: "Miešanie dosiahlo denný limit. Skús zajtra alebo nám napíš.",
          },
          { status: 429 },
        );
      }
    } catch (err) {
      console.error("[kombinacia] rate limit zlyhal:", err);
    }
  }

  // Referenčné fotky — prvá ide ako vstupný obrázok, zvyšné ako referencie.
  const base = new URL(request.url).origin;
  const nacitane: ReferenceImage[] = [];
  for (const e of efekty) {
    try {
      const r = await fetch(`${base}${e.src}`);
      if (!r.ok) continue;
      const buf = await r.arrayBuffer();
      nacitane.push({ base64: arrayBufferToBase64(buf), mimeType: "image/jpeg" });
    } catch {
      /* vzorka sa nenačítala — pôjde sa bez nej */
    }
  }
  if (nacitane.length !== efekty.length) {
    return NextResponse.json(
      { ok: false, error: "vzorky_nedostupne" },
      { status: 500 },
    );
  }

  const mena = efekty.map((e) => e.label);
  const prompt = [
    `Create a photorealistic top-down close-up of a poured metallic epoxy floor that blends these TopStone EP11 pigments together: ${mena.join(", ")}.`,
    "Use the attached sample photos as the exact colour reference — the hues, sheen and pigment behaviour must match them, do not invent new colours.",
    "Blend them the way a real poured floor looks: metallic pigment drifts into cells and lacing, soft feathered edges where the colours meet, subtle depth and translucency, no hard lines and no repeating pattern.",
    "High-gloss clear topcoat with soft diffuse studio reflections, seamless surface, no objects, no furniture, no text, no watermark.",
    "CRITICAL: the poured surface must completely fill the frame and bleed off all four edges. Do not reproduce the white background, board edge, table, wall or any margin visible in the reference photos — crop into the material only.",
    "Square framing, evenly lit, sharp focus, looks like a real photograph of a finished floor.",
  ].join(" ");

  const [prvy, ...zvysok] = nacitane;
  const vysledok = await generateFloorEdit(prvy.base64, prvy.mimeType, prompt, zvysok);

  if (!vysledok.ok) {
    const dovod = vysledok.reason ?? "generovanie_zlyhalo";
    console.error("[kombinacia] generovanie zlyhalo:", dovod);
    return NextResponse.json(
      { ok: false, error: dovod, message: hlaskaPreDovod(dovod) },
      { status: 502 },
    );
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.visualizerGeneration.create({
        data: { ip, texture: "kombinacia", color: efekty.map((e) => e.id).join("+"), ok: true },
      });
    } catch {
      /* zápis do štatistiky nesmie zhodiť odpoveď */
    }
  }

  return NextResponse.json({
    ok: true,
    imageBase64: vysledok.imageBase64,
    mimeType: vysledok.mimeType ?? "image/png",
    nazov: mena.join(" + "),
  });
}

/**
 * Zrozumiteľné hlásenie namiesto „skús to znovu" pri veciach, kde opakovanie
 * nepomôže. Bez toho sa nedá odlíšiť chýbajúci kľúč od výpadku Gemini.
 */
function hlaskaPreDovod(dovod: string): string {
  if (dovod === "api_key_missing") {
    return "AI generovanie nie je v tomto prostredí nastavené (chýba GEMINI_API_KEY). Na epoxidovo.sk funguje.";
  }
  if (dovod === "no_image_in_response") {
    return "AI tentoraz nevrátila obrázok. Skús inú kombináciu.";
  }
  if (dovod.startsWith("blocked_")) {
    return "AI odmietla túto kombináciu vygenerovať. Skús inú.";
  }
  if (dovod.startsWith("api_error_")) {
    return `Služba generovania hlási chybu (${dovod.replace("api_error_", "")}). Skús o chvíľu.`;
  }
  if (dovod === "network_error") {
    return "Nepodarilo sa spojiť so službou generovania. Skús o chvíľu.";
  }
  return "Nepodarilo sa namiešať vzorku. Skús to znovu.";
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}
