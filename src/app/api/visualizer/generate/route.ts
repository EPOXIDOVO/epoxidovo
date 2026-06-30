export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { generateFloorEdit } from "@/lib/gemini-image";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { buildGeminiPrompt, getColorPreset, isValidFinish, getReferenceImagePaths, isValidTextureSlug } from "@/lib/visualizer-presets";
import type { Finish, TextureSlug } from "@/lib/visualizer-presets";
import type { ReferenceImage } from "@/lib/gemini-image";

/**
 * POST /api/visualizer/generate
 *
 * Hlavná generácia: vymení podlahu na fotke za zvolenú textúru/farbu/lak.
 * Cost: ~€0.067 per call.
 *
 * ═══ BUDGET PROTECTION (5 vrstiev) ═══
 *   1. Kill switch (VISUALIZER_ENABLED=false) — okamžite vypnúť celé API
 *   2. Origin/Referer check — len epoxidovo.sk + localhost môžu volať
 *   3. Turnstile token (Cloudflare anti-bot challenge)
 *   4. Per-IP rate limit: 2 úspešné gen / 24h
 *   5. Global cap: 25 úspešných gen / 24h (~€1.68/deň worst-case)
 *
 * ═══ PROMPT INJECTION PROTECTION ═══
 * Klient NEMÔŽE poslať custom prompt — posiela LEN texture+color+finish slugy,
 * server ich validuje voči predefinovanému zoznamu (TEXTURES/COLORS/FINISHES)
 * a sám zostavuje finálny prompt cez buildGeminiPrompt(). Prompt vždy hovorí
 * "Replace ONLY the existing floor" — Gemini nedostane šancu generovať
 * tváre, autá, alebo iný non-floor obsah.
 *
 * Request body (JSON):
 *   {
 *     imageBase64: string,         // <= 4 MB raw
 *     mimeType: string,            // jpg/png/webp only
 *     texture: TextureSlug,        // hladka/metalicka/chips/mramor (validated)
 *     colorSlug: string,           // must exist in COLORS[texture]
 *     finish?: "matna" | "leskla", // default leskla
 *     turnstileToken: string,      // Cloudflare anti-bot
 *   }
 *
 * Response:
 *   { ok: true, imageBase64, mimeType }
 *   { ok: false, error, message }
 */

interface GenerateBody {
  imageBase64?: string;
  mimeType?: string;
  texture?: string;
  colorSlug?: string;
  /** Povrchový lak — matná / lesklá. Default: "leskla" pre BC. */
  finish?: string;
  turnstileToken?: string;
}

/**
 * Max veľkosť uploadovanej base64 fotky. 4 MB raw = ~5.6 MB base64.
 * Stačí pre prakticky každú mobilnú fotku po klientskom resize.
 * Menej = menej Gemini cost (vstup sa škáluje s veľkosťou) + ťažší abuse.
 */
const MAX_BASE64_SIZE = 4 * 1024 * 1024 * 1.4;
const ALLOWED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/**
 * Per-IP limit: max 5 úspešných generácií / 24h.
 * Reálny zákazník typicky chce vyskúšať viacero kombinácií (rôzne farby,
 * matný vs lesklý, prípadne dva typy textúry) než sa rozhodne — 5 dáva dosť
 * priestoru. Bot s rotujúcim Turnstile dostane 5 hits z 1 IP, potom 24h pauza.
 */
const RATE_LIMIT_PER_DAY_PER_IP = 5;

/**
 * Globálny denný cap: max 30 úspešných generácií / 24h naprieč VŠETKÝMI IP.
 * Pri ceně ~€0.067/gen = max ~€2/deň = ~€60/mesiac worst-case
 * aj pri sustained distribuovanom attacku.
 * Reálne pri 5 user/deň × 3 generácie = 15/deň = ~€30/mesiac, cap 30 dáva
 * 2× headroom pre špičky.
 */
const GLOBAL_DAILY_CAP = 30;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Dovolené originy (Origin / Referer header). Bot s curl/python bez správneho
 * Origin headera bude blokovaný. Browseri s legit usage ho posielajú automaticky.
 * Spoofing možný, ale raises the bar — kombinované s Turnstile + rate limit.
 */
const ALLOWED_HOSTS = new Set([
  "epoxidovo.sk",
  "www.epoxidovo.sk",
  "localhost",
  "127.0.0.1",
]);

/**
 * Edge-runtime safe ArrayBuffer → base64 (žiadny Buffer API).
 * Spracováva po chunkoch aby sa nevybuchol stack pri veľkých obrázkoch.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 0x8000;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    chunks.push(
      String.fromCharCode.apply(
        null,
        Array.from(bytes.subarray(i, i + CHUNK_SIZE)),
      ),
    );
  }
  return btoa(chunks.join(""));
}

function isAllowedOrigin(req: NextRequest): boolean {
  const originHeader = req.headers.get("origin") ?? req.headers.get("referer");
  if (!originHeader) return false;
  try {
    const url = new URL(originHeader);
    const host = url.hostname;
    if (ALLOWED_HOSTS.has(host)) return true;
    // CF Pages preview deploys (napr. abc123.epoxidovo.pages.dev)
    if (host.endsWith(".epoxidovo.sk")) return true;
    if (host.endsWith(".epoxidovo.pages.dev")) return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // 0) Kill switch — admin môže okamžite vypnúť vizualizér env premennou
  // VISUALIZER_ENABLED=false (napr. ak by sa objavil abuse, alebo budget alert).
  if (process.env.VISUALIZER_ENABLED === "false") {
    return NextResponse.json(
      {
        ok: false,
        error: "feature_disabled",
        message:
          "AI Vizualizér je dočasne nedostupný. Skús prosím neskôr alebo nám napíš cez kontaktný formulár.",
      },
      { status: 503 },
    );
  }

  // 0.5) Origin / Referer check — blokuje basic bot scripts (curl/python bez
  // správneho headera). Spoofovateľné, ale Turnstile + rate limit vrstvy stoja
  // za týmto. Reálne browser-based usage Origin/Referer header posiela.
  if (!isAllowedOrigin(req)) {
    return NextResponse.json(
      { ok: false, error: "invalid_origin", message: "Neplatný zdroj požiadavky." },
      { status: 403 },
    );
  }

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // 1) Input validation
  if (!body.imageBase64 || body.imageBase64.length > MAX_BASE64_SIZE) {
    return NextResponse.json(
      { ok: false, error: "invalid_image", message: "Nevalidný alebo príliš veľký obrázok." },
      { status: 400 },
    );
  }
  if (!body.mimeType || !ALLOWED_MIMES.has(body.mimeType)) {
    return NextResponse.json(
      { ok: false, error: "unsupported_format", message: "Podporujeme JPG, PNG, WebP." },
      { status: 400 },
    );
  }
  if (!body.texture || !body.colorSlug) {
    return NextResponse.json(
      { ok: false, error: "missing_preset", message: "Vyber textúru a farbu." },
      { status: 400 },
    );
  }

  // Validujeme texture+color voči predefinovanému zoznamu — nikdy nedovolíme
  // free-text prompt injection z klienta.
  const preset = getColorPreset(body.texture, body.colorSlug);
  if (!preset) {
    return NextResponse.json(
      { ok: false, error: "invalid_preset", message: "Neznáma kombinácia textúry/farby." },
      { status: 400 },
    );
  }

  // Finish (matná/lesklá) — voliteľné, default leskla pre backward compat.
  const finish: Finish =
    body.finish && isValidFinish(body.finish) ? body.finish : "leskla";

  // 2) Turnstile (anti-bot)
  const remoteIp =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  const turnstileResult = await verifyTurnstileToken(
    body.turnstileToken,
    remoteIp,
  );
  if (!turnstileResult.ok) {
    return NextResponse.json(
      { ok: false, error: "captcha_failed", message: "Anti-spam overenie zlyhalo." },
      { status: 403 },
    );
  }

  // 3) Rate limits — 2 vrstvy:
  //    (a) Per-IP: max 3 úspešné gen / 24h (chráni pred bot abuse z 1 IP)
  //    (b) Globálny cap: max 100 úspešných gen / 24h (chráni budget pri
  //        distribuovanom attacku z mnohých IP)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const windowStart = new Date(Date.now() - RATE_WINDOW_MS);

      const [perIpCount, globalCount] = await Promise.all([
        prisma.visualizerGeneration.count({
          where: { ip: remoteIp, createdAt: { gte: windowStart }, ok: true },
        }),
        prisma.visualizerGeneration.count({
          where: { createdAt: { gte: windowStart }, ok: true },
        }),
      ]);

      if (perIpCount >= RATE_LIMIT_PER_DAY_PER_IP) {
        return NextResponse.json(
          {
            ok: false,
            error: "rate_limit_ip",
            message: `Dosiahol si denný limit ${RATE_LIMIT_PER_DAY_PER_IP} vizualizácií. Skús zajtra alebo nám pošli fotku priamo cez formulár.`,
          },
          { status: 429 },
        );
      }
      if (globalCount >= GLOBAL_DAILY_CAP) {
        return NextResponse.json(
          {
            ok: false,
            error: "rate_limit_global",
            message:
              "AI Vizualizér dosiahol denný globálny limit. Skús zajtra alebo nám napíš cez formulár — radi ti pošleme ukážky aj bez AI.",
          },
          { status: 429 },
        );
      }
    } catch (err) {
      console.error("[visualizer.generate] rate limit check failed:", err);
      // Ak DB zlyhá → permissive (neblokujeme usera, len logujeme)
    }
  }

  // 4) Generate cez Gemini Nano Banana 2
  const normalizedMime = body.mimeType === "image/jpg" ? "image/jpeg" : body.mimeType;
  const prompt = buildGeminiPrompt(preset.texture, preset.color, finish);

  // Reference images pre style-guided generáciu (len pre mramor/metalicka).
  // Fetch z public/images/realizacie/... cez request origin.
  // Posielame max 2 referencie (cost trade-off, viac = drahšie tokeny).
  let referenceImages: ReferenceImage[] = [];
  if (isValidTextureSlug(body.texture)) {
    const refPaths = getReferenceImagePaths(body.texture as TextureSlug).slice(0, 2);
    if (refPaths.length > 0) {
      // SSRF guard: NEDÔVERUJEME Host headeru — attacker by mohol nastaviť
      // Host: evil.com a presmerovať fetch ref-image na svoj server.
      // Použijeme hardcoded production URL, dev fallback iba pre localhost.
      const reqHost = req.headers.get("host") ?? "";
      const isLocalhost = reqHost.startsWith("localhost") || reqHost.startsWith("127.");
      const origin = isLocalhost
        ? `http://${reqHost}`
        : "https://epoxidovo.sk";
      try {
        referenceImages = await Promise.all(
          refPaths.map(async (path) => {
            const resp = await fetch(`${origin}${path}`);
            if (!resp.ok) throw new Error(`ref fetch ${path} → ${resp.status}`);
            const buf = await resp.arrayBuffer();
            const base64 = arrayBufferToBase64(buf);
            const mimeType = path.endsWith(".png")
              ? "image/png"
              : path.endsWith(".webp")
                ? "image/webp"
                : "image/jpeg";
            return { base64, mimeType };
          }),
        );
      } catch (err) {
        console.error("[visualizer.generate] reference image fetch failed:", err);
        // Fallback: pokračujeme bez referencií (AI generuje generic vzor).
        referenceImages = [];
      }
    }
  }

  const result = await generateFloorEdit(
    body.imageBase64,
    normalizedMime,
    prompt,
    referenceImages,
  );

  // 5) Log to DB (always — for analytics + admin review of results)
  // Ukladáme input + output base64 aby admin mohol skontrolovať kvalitu AI.
  // Pri zlyhaní ukladáme len input (bez output) pre debug.
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.visualizerGeneration.create({
        data: {
          ip: remoteIp,
          texture: body.texture,
          color: body.colorSlug,
          ok: result.ok,
          errorCode: result.ok ? null : result.reason ?? null,
          inputImageData: body.imageBase64,
          inputMimeType: normalizedMime,
          outputImageData: result.ok ? result.imageBase64 ?? null : null,
          outputMimeType: result.ok ? result.mimeType ?? null : null,
        },
      });
    } catch (err) {
      console.error("[visualizer.generate] DB log failed:", err);
    }
  }

  if (!result.ok) {
    // Špeciálny case: API key chýba (server-config problém, nie user error)
    if (result.reason === "api_key_missing") {
      return NextResponse.json(
        {
          ok: false,
          error: "service_unavailable",
          message:
            "AI Vizualizér sa práve konfiguruje, skús prosím o pár minút.",
        },
        { status: 503 },
      );
    }
    const message = result.reason?.startsWith("blocked_")
      ? "AI odmietla túto požiadavku. Skús inú fotku."
      : result.reason === "no_image_in_response"
        ? "AI nevrátila obrázok. Skús to znovu o chvíľu."
        : "Nepodarilo sa vygenerovať. Skús znovu o chvíľu.";
    return NextResponse.json(
      { ok: false, error: result.reason ?? "generation_failed", message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    imageBase64: result.imageBase64,
    mimeType: result.mimeType,
  });
}
