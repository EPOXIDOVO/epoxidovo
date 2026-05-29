export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { LeadInputSchema } from "@/lib/leadSchema";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/lead — submission z kontaktného formulára.
 *
 * Validuje cez Zod, blokuje boty (honeypot).
 * Ak je DATABASE_URL nastavený → uloží do Postgres cez Prisma.
 * Ak je RESEND_API_KEY nastavený → pošle 2 emaily (admin + customer).
 * Bez týchto env je fallback: log do servera + tichý success (aby form nezlyhal).
 */
// Max payload size — 32 KB stačí na akýkoľvek lead. Bráni DoS cez veľký payload.
const MAX_BODY_BYTES = 32 * 1024;

export async function POST(req: NextRequest) {
  try {
    // 0a) Rate limit — 5 attempts / 20 min per IP per endpoint
    const ip = getClientIp(req.headers);
    const rl = rateLimit({
      key: "lead-submit",
      identifier: ip,
      limit: 5,
      windowMs: 20 * 60 * 1000,
    });
    if (!rl.ok) {
      const retryAfter = Math.ceil(rl.resetMs / 1000);
      console.warn("[lead] rate limit exceeded ip:", ip);
      return NextResponse.json(
        {
          error: "rate_limited",
          message:
            "Príliš veľa požiadaviek. Skús to znova o pár minút, alebo nám zavolaj priamo.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(retryAfter),
          },
        },
      );
    }

    // 0b) Payload size guard — Content-Length check + reálny body size check
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "payload_too_large", message: "Príliš veľká požiadavka." },
        { status: 413 },
      );
    }
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "payload_too_large", message: "Príliš veľká požiadavka." },
        { status: 413 },
      );
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "invalid_json", message: "Neplatný formát požiadavky." },
        { status: 400 },
      );
    }

    // 1) Validácia
    const parsed = LeadInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // 2) Honeypot — boty
    if (data.website && data.website.length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 2b) Cloudflare Turnstile verification — bráni botom + brute force
    const headers = req.headers;
    const remoteIp = ip !== "unknown" ? ip : null;
    const turnstileResult = await verifyTurnstileToken(
      data.turnstileToken,
      remoteIp,
    );
    if (!turnstileResult.ok) {
      console.warn(
        "[lead] turnstile rejected:",
        turnstileResult.reason,
        "ip:",
        remoteIp,
      );
      return NextResponse.json(
        {
          error: "captcha_failed",
          message:
            "Anti-spam overenie zlyhalo. Skús prosím znovu (refresh stránky).",
        },
        { status: 403 },
      );
    }

    // 2c) Disposable email blocker — bráni mailinator/tempmail/atď.
    if (isDisposableEmail(data.email)) {
      console.warn(
        "[lead] disposable email blocked:",
        data.email,
        "ip:",
        remoteIp,
      );
      return NextResponse.json(
        {
          error: "disposable_email",
          message:
            "Použi prosím svoj reálny email — dočasné / disposable schránky neakceptujeme.",
        },
        { status: 400 },
      );
    }

    // 3) Tracking metadata
    const userAgent = headers.get("user-agent") ?? null;
    const referrer = headers.get("referer") ?? null;

    const leadData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone || null,
      spaceType: data.spaceType || null,
      service: data.service || null,
      area:
        typeof data.area === "number"
          ? data.area
          : data.area
            ? Number(data.area)
            : null,
      message: data.message || null,
      source: data.source || "contact_form",
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      userAgent,
      referrer,
    };

    // 4) DB save (ak je DATABASE_URL skutočná)
    let leadId: string | null = null;
    if (
      process.env.DATABASE_URL &&
      !process.env.DATABASE_URL.includes("placeholder")
    ) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const lead = await prisma.lead.create({ data: leadData });
        leadId = lead.id;
      } catch (dbErr) {
        console.error("[lead] DB save failed:", dbErr);
        // Pokračujeme aj bez DB — neblokujeme user-a
      }
    } else {
      console.warn(
        "[lead] DATABASE_URL not set — lead NOT saved to DB. Lead data:",
        leadData,
      );
    }

    // 5) Email cez Resend (ak je RESEND_API_KEY)
    if (process.env.RESEND_API_KEY) {
      try {
        const { sendLeadEmails } = await import("@/lib/email");
        await sendLeadEmails(leadData);
      } catch (mailErr) {
        console.error("[lead] email send failed:", mailErr);
      }
    } else {
      console.warn(
        "[lead] RESEND_API_KEY not set — emails NOT sent. Lead data:",
        leadData,
      );
    }

    return NextResponse.json(
      { ok: true, id: leadId, mode: leadId ? "saved" : "logged" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[lead] unexpected error:", err);
    return NextResponse.json(
      {
        error: "server_error",
        message: "Niečo sa pokazilo. Skús prosím neskôr.",
      },
      { status: 500 },
    );
  }
}
