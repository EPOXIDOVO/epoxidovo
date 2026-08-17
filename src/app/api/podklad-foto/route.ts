export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { sendPodkladFotoEmail } from "@/lib/email";

/**
 * POST /api/podklad-foto — fotka podkladu z konfigurátora.
 *
 * Lead samotný ide cez /api/lead (uloží sa do DB). Tento endpoint rieši len
 * fotku: pošle ju e-mailom ako prílohu na info@, aby sa dala hneď pozrieť.
 * Bez RESEND_API_KEY sa ticho preskočí a klient dostane { ok: true, skipped }.
 */

const MAX_BODY_BYTES = 8 * 1024 * 1024; // 8 MB — fotka z mobilu sa zmestí

const ALLOWED_HOSTS = new Set([
  "epoxidovo.sk",
  "www.epoxidovo.sk",
  "localhost",
  "127.0.0.1",
]);

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    if (ALLOWED_HOSTS.has(host)) return true;
    if (host.endsWith(".epoxidovo.sk")) return true;
    if (host.endsWith(".epoxidovo.pages.dev")) return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const dlzka = Number(req.headers.get("content-length") ?? 0);
  if (dlzka > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  let telo: Record<string, unknown>;
  try {
    telo = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const str = (k: string, max: number) => {
    const v = telo[k];
    return typeof v === "string" ? v.slice(0, max).trim() : "";
  };

  const foto = typeof telo.foto === "string" ? telo.foto : "";
  // dataURL -> ciste base64; ine formaty odmietame
  const m = foto.match(/^data:image\/(png|jpe?g|webp|heic|heif);base64,([A-Za-z0-9+/=]+)$/);
  if (!m) {
    return NextResponse.json({ error: "invalid_image" }, { status: 400 });
  }
  const base64 = m[2];
  if (base64.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const meno = str("meno", 80);
  const priezvisko = str("priezvisko", 80);
  const email = str("email", 200);
  const telefon = str("telefon", 30);
  if (meno.length < 2 || priezvisko.length < 2 || !email.includes("@") || telefon.length < 9) {
    return NextResponse.json({ error: "invalid_contact" }, { status: 400 });
  }

  try {
    const r = await sendPodkladFotoEmail({
      meno,
      priezvisko,
      email,
      telefon,
      kontext: str("kontext", 1000),
      fotoBase64: base64,
      fotoNazov: str("fotoNazov", 120) || `podklad.${m[1] === "jpeg" ? "jpg" : m[1]}`,
    });
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    console.error("[podklad-foto] odoslanie zlyhalo", e);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
