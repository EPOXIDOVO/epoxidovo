export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { checkIfFloor } from "@/lib/gemini-image";
import { verifyTurnstileToken } from "@/lib/turnstile";

/**
 * POST /api/visualizer/validate
 *
 * Skontroluje uploadnutý obrázok cez Gemini Flash:
 *  - obsahuje viditeľnú podlahu?
 *  - nie je NSFW / blocked?
 *
 * Beží PRED drahou /generate volaním. Cost: ~$0.0005 per call.
 *
 * Request body (JSON):
 *   {
 *     imageBase64: string,      // base64 bez "data:image/jpeg;base64," prefixu
 *     mimeType: string,         // image/jpeg | image/png | image/webp
 *     turnstileToken: string,   // Cloudflare Turnstile token
 *   }
 *
 * Response:
 *   { ok: true }                            → môžeš pokračovať na /generate
 *   { ok: false, reason: string, message }  → human-readable error
 */

interface ValidateBody {
  imageBase64?: string;
  mimeType?: string;
  turnstileToken?: string;
}

const MAX_BASE64_SIZE = 5 * 1024 * 1024 * 1.4; // ~5MB image after base64 inflation
const ALLOWED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  let body: ValidateBody;
  try {
    body = (await req.json()) as ValidateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // 1) Validácia inputov
  if (!body.imageBase64 || typeof body.imageBase64 !== "string") {
    return NextResponse.json(
      { ok: false, error: "missing_image", message: "Chýba obrázok." },
      { status: 400 },
    );
  }
  if (body.imageBase64.length > MAX_BASE64_SIZE) {
    return NextResponse.json(
      {
        ok: false,
        error: "image_too_large",
        message: "Obrázok je príliš veľký. Max 5 MB.",
      },
      { status: 413 },
    );
  }
  if (!body.mimeType || !ALLOWED_MIMES.has(body.mimeType)) {
    return NextResponse.json(
      {
        ok: false,
        error: "unsupported_format",
        message: "Podporujeme len JPG, PNG a WebP.",
      },
      { status: 400 },
    );
  }

  // 2) Turnstile check (anti-bot)
  const remoteIp =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    null;
  const turnstileResult = await verifyTurnstileToken(
    body.turnstileToken,
    remoteIp,
  );
  if (!turnstileResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "captcha_failed",
        message: "Anti-spam overenie zlyhalo. Skús prosím znovu.",
      },
      { status: 403 },
    );
  }

  // 3) Floor check cez Gemini Flash
  const normalizedMime = body.mimeType === "image/jpg" ? "image/jpeg" : body.mimeType;
  const result = await checkIfFloor(body.imageBase64, normalizedMime);
  if (!result.ok) {
    const message = result.reason?.startsWith("blocked_")
      ? "Tento typ obsahu nie je možné spracovať. Skús inú fotku."
      : "Na fotke nevidíme jasnú podlahu. Skús fotku miestnosti, kde je vidno aspoň 25 % podlahy.";
    return NextResponse.json(
      { ok: false, error: result.reason ?? "not_a_floor", message },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true });
}
