export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { LeadInputSchema } from "@/lib/leadSchema";
import { verifyTurnstileToken } from "@/lib/turnstile";

/**
 * POST /api/lead — submission z kontaktného formulára.
 *
 * Validuje cez Zod, blokuje boty (honeypot).
 * Ak je DATABASE_URL nastavený → uloží do Postgres cez Prisma.
 * Ak je RESEND_API_KEY nastavený → pošle 2 emaily (admin + customer).
 * Bez týchto env je fallback: log do servera + tichý success (aby form nezlyhal).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
    const remoteIp =
      headers.get("cf-connecting-ip") ??
      headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      null;
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
