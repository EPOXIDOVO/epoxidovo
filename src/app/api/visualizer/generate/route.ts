export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { generateFloorEdit } from "@/lib/gemini-image";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { buildGeminiPrompt, getColorPreset } from "@/lib/visualizer-presets";

/**
 * POST /api/visualizer/generate
 *
 * Hlavná generácia: vymení podlahu na fotke za zvolenú textúru/farbu.
 * Cost: ~$0.067 per call. Chránené:
 *   1. Turnstile token (anti-bot)
 *   2. Per-IP rate limit cez Prisma (max 5 / 24h)
 *   3. Validácia textury + color slug oproti predefinovanému zoznamu
 *
 * Request body (JSON):
 *   {
 *     imageBase64: string,
 *     mimeType: string,
 *     texture: TextureSlug,
 *     colorSlug: string,
 *     turnstileToken: string,
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
  turnstileToken?: string;
}

const MAX_BASE64_SIZE = 5 * 1024 * 1024 * 1.4;
const ALLOWED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const RATE_LIMIT_PER_DAY = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
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

  // 3) Rate limit per IP (max 5 generations / 24h)
  // Optimistic check: ak nie je DATABASE_URL, preskočíme limit (dev mode).
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const windowStart = new Date(Date.now() - RATE_WINDOW_MS);
      const recentCount = await prisma.visualizerGeneration.count({
        where: { ip: remoteIp, createdAt: { gte: windowStart }, ok: true },
      });
      if (recentCount >= RATE_LIMIT_PER_DAY) {
        return NextResponse.json(
          {
            ok: false,
            error: "rate_limit",
            message: `Dosiahol si denný limit ${RATE_LIMIT_PER_DAY} vizualizácií. Skús zajtra alebo nám pošli fotku priamo cez formulár.`,
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
  const prompt = buildGeminiPrompt(preset.texture, preset.color);
  const result = await generateFloorEdit(body.imageBase64, normalizedMime, prompt);

  // 5) Log to DB (always — for analytics, even failures)
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
        },
      });
    } catch (err) {
      console.error("[visualizer.generate] DB log failed:", err);
    }
  }

  if (!result.ok) {
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
