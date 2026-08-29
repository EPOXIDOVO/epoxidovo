/**
 * FÁZA 3/4 — platby ako pluggable rozhranie.
 *
 * Vždy dostupné: bankový prevod + dobierka.
 * Kartová brána: Stripe Checkout adapter — AKTIVUJE SA automaticky, keď je
 * v prostredí STRIPE_SECRET_KEY (CF Pages → Settings → Env vars). Bez kľúča
 * sa karta v checkoute nezobrazí. Integrácia cez REST API (edge-safe,
 * žiadne SDK). Webhook potvrdenia: /api/order/stripe-webhook (vyžaduje
 * STRIPE_WEBHOOK_SECRET).
 *
 * Ceny sú konečné (neplatiteľ DPH) — do brány sa posiela finálna suma.
 */

export type PaymentMethodId = "prevod" | "dobierka" | "karta";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
  /** Príplatok k objednávke (napr. dobierka). null = bez príplatku. */
  surchargeEur: number | null;
}

const PREVOD: PaymentMethod = {
  id: "prevod",
  label: "Bankový prevod",
  description:
    "Platobné údaje pošleme e-mailom. Tovar expedujeme po pripísaní platby.",
  surchargeEur: null,
};

const DOBIERKA: PaymentMethod = {
  id: "dobierka",
  label: "Dobierka",
  description: "Zaplatíte kuriérovi pri prevzatí.",
  surchargeEur: 1.0, // dobierka +1 € (ako konkurencia montana.sk, user 2026-08-27)
};

const KARTA: PaymentMethod = {
  id: "karta",
  label: "Platba kartou online",
  description: "Bezpečná platba kartou cez Stripe.",
  surchargeEur: null,
};

/** Server-side: či je kartová brána nakonfigurovaná. */
export function isCardGatewayConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Metódy dostupné pre checkout (server-side rozhodnutie). */
export function getPaymentMethods(): PaymentMethod[] {
  const methods = [PREVOD, DOBIERKA];
  if (isCardGatewayConfigured()) methods.push(KARTA);
  return methods;
}

export interface StripeLineItem {
  name: string;
  unitAmountCents: number;
  qty: number;
}
export interface StripeSessionInput {
  orderId: string;
  lineItems: StripeLineItem[];
  shippingCents?: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Vytvorí Stripe Checkout Session cez REST API a vráti redirect URL.
 * Volať LEN server-side. Vyhodí chybu, ak brána nie je nakonfigurovaná.
 */
export async function createStripeCheckoutSession(
  input: StripeSessionInput,
): Promise<{ url: string; sessionId: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe nie je nakonfigurovaný (STRIPE_SECRET_KEY).");

  const body = new URLSearchParams({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: input.orderId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });
  // Itemizovaný checkout — každý produkt zvlášť + doprava (user 2026-08-27).
  input.lineItems.forEach((li, i) => {
    body.set(`line_items[${i}][price_data][currency]`, "eur");
    body.set(`line_items[${i}][price_data][product_data][name]`, li.name.slice(0, 250));
    body.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(li.unitAmountCents)));
    body.set(`line_items[${i}][quantity]`, String(li.qty));
  });
  if (input.shippingCents && input.shippingCents > 0) {
    const i = input.lineItems.length;
    body.set(`line_items[${i}][price_data][currency]`, "eur");
    body.set(`line_items[${i}][price_data][product_data][name]`, "Doprava kuriérom");
    body.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(input.shippingCents)));
    body.set(`line_items[${i}][quantity]`, "1");
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!res.ok || !json.url || !json.id) {
    throw new Error(json.error?.message ?? "Stripe session sa nepodarilo vytvoriť.");
  }
  return { url: json.url, sessionId: json.id };
}

// ── DOPRAVA ──────────────────────────────────────────────────────────────

export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  /** null = cenu potvrdíme e-mailom (sadzby dopravcu zatiaľ nemáme). */
  priceEur: number | null;
}

/**
 * Doprava podľa hmotnosti — sadzby prevzaté z konkurencie montana.sk
 * (predáva tie isté Sika materiály; tekuté materiály = farby/penetrácie/epoxidy
 * posiela kuriérom SDS podľa hmotnosti). User 2026-08-27: „cenu dopravy daj
 * ako má konkurencia".
 *
 * Doprava ZADARMO nad 100 € (do 30 kg). Nad 53 kg → paleta, cenu potvrdíme
 * e-mailom. Osobný odber je vždy zadarmo.
 */
export const FREE_SHIPPING_MIN_EUR = 100;
const FREE_SHIPPING_MAX_KG = 30;

export const SHIPPING_RATES: { maxKg: number; priceEur: number }[] = [
  { maxKg: 3.99, priceEur: 4.0 },
  { maxKg: 9.99, priceEur: 4.82 },
  { maxKg: 14.99, priceEur: 5.43 },
  { maxKg: 19.99, priceEur: 6.05 },
  { maxKg: 29.99, priceEur: 7.07 },
  { maxKg: 39.99, priceEur: 8.71 },
  { maxKg: 49.99, priceEur: 11.17 },
  { maxKg: 52.99, priceEur: 18.45 },
];

export const PICKUP_ADDRESS = "Školská 480, 034 96 Komjatná";

export function getShippingOptions(
  weightKg: number,
  subtotalEur: number,
): ShippingOption[] {
  const hm = Math.round(weightKg * 10) / 10;
  let kurierPrice: number | null;
  let kurierDesc: string;
  if (subtotalEur >= FREE_SHIPPING_MIN_EUR && weightKg <= FREE_SHIPPING_MAX_KG) {
    kurierPrice = 0;
    kurierDesc = `Doprava ZADARMO — objednávka nad ${FREE_SHIPPING_MIN_EUR} € (do ${FREE_SHIPPING_MAX_KG} kg). Hmotnosť ${hm} kg.`;
  } else {
    const rate = SHIPPING_RATES.find((r) => weightKg <= r.maxKg);
    if (rate) {
      kurierPrice = rate.priceEur;
      kurierDesc = `Kuriér DPD / GLS / SDS. Hmotnosť ${hm} kg. Doručenie do 2–4 dní.`;
    } else {
      kurierPrice = null; // paleta / nadrozmer
      kurierDesc = `Ťažká zásielka (${hm} kg) — preprava na palete, presnú cenu potvrdíme e-mailom.`;
    }
  }
  return [
    {
      id: "pickup",
      label: "Osobný odber — Komjatná",
      description: `${PICKUP_ADDRESS}. Pripravíme do 24 h, zavoláme.`,
      priceEur: 0,
    },
    {
      id: "kurier",
      label: "Kuriér",
      description: kurierDesc,
      priceEur: kurierPrice,
    },
  ];
}
