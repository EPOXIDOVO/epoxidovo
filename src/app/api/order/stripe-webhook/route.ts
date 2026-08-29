export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

/**
 * Stripe webhook — potvrdenie platby (checkout.session.completed).
 *
 * Overuje podpis Stripe-Signature cez HMAC-SHA256 (WebCrypto, edge-safe).
 * Aktivuje sa nastavením STRIPE_WEBHOOK_SECRET (whsec_...) v env — endpoint
 * URL pri vytváraní webhoooku v Stripe dashboarde:
 *   https://epoxidovo.sk/api/order/stripe-webhook
 *
 * Zatiaľ len loguje potvrdené platby (objednávky nemajú DB) — obchod dostane
 * platbu potvrdenú aj v Stripe dashboarde/e-maile.
 */

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  // Stripe-Signature: t=timestamp,v1=signature
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => p.split("=") as [string, string]),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // tolerancia 5 min proti replay
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${payload}`),
  );
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // constant-time porovnanie
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // brána nie je nakonfigurovaná — webhook neprijímame
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }
  const sig = req.headers.get("stripe-signature");
  const payload = await req.text();
  if (!sig || !(await verifyStripeSignature(payload, sig, secret))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(payload) as {
      type?: string;
      data?: { object?: { client_reference_id?: string; amount_total?: number } };
    };
    if (event.type === "checkout.session.completed") {
      const obj = event.data?.object;
      const orderId = obj?.client_reference_id;
      console.log(
        "[stripe] payment completed — order:",
        orderId,
        "amount:",
        obj?.amount_total != null ? obj.amount_total / 100 : "?",
        "EUR",
      );
      // Označ objednávku ako zaplatenú (user 2026-08-27) — admin vidí stav
      // platby. Best-effort: výpadok DB nesmie webhook zhodiť (Stripe by
      // inak retry-oval donekonečna).
      if (orderId) {
        try {
          const { prisma } = await import("@/lib/prisma");
          await prisma.eshopOrder.update({
            where: { id: orderId },
            data: { paidAt: new Date() },
          });
        } catch (e) {
          console.error("[stripe] paidAt update zlyhal pre", orderId, e);
        }
      }
    }
  } catch {
    /* neznámy payload — potvrdíme prijatie, Stripe nemá retry-ovať */
  }
  return NextResponse.json({ received: true });
}
