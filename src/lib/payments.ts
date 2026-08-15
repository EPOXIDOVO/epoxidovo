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
  surchargeEur: null, // príplatok doplníme keď bude potvrdený cenník dopravcu
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

export interface StripeSessionInput {
  orderId: string;
  amountEur: number;
  customerEmail: string;
  description: string;
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
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][product_data][name]": input.description,
    "line_items[0][price_data][unit_amount]": String(
      Math.round(input.amountEur * 100),
    ),
    "line_items[0][quantity]": "1",
    customer_email: input.customerEmail,
    client_reference_id: input.orderId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

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
 * Doprava podľa hmotnosti a hazardous obsahu.
 *
 * POZOR: sadzby kuriéra pre ťažké/ADR zásielky zatiaľ NEMÁME potvrdené —
 * nevymýšľame ich. Kuriér sa preto zobrazuje s „cenu potvrdíme e-mailom".
 * Osobný odber je vždy zadarmo. Keď user dodá cenník dopravcu, doplní sa
 * do SHIPPING_RATES a checkout začne počítať automaticky.
 */
export const SHIPPING_RATES: { maxKg: number; priceEur: number; hazardous: boolean }[] =
  [
    // doplniť po potvrdení cenníka dopravcu, napr.:
    // { maxKg: 30, priceEur: 9.9, hazardous: false },
  ];

export const PICKUP_ADDRESS = "Školská 480, 034 96 Komjatná";

export function getShippingOptions(
  weightKg: number,
  containsHazardous: boolean,
): ShippingOption[] {
  const rate = SHIPPING_RATES.find(
    (r) => weightKg <= r.maxKg && r.hazardous === containsHazardous,
  );
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
      description: containsHazardous
        ? `Zásielka obsahuje chemické produkty (ADR) — cenu dopravy potvrdíme e-mailom. Hmotnosť ${weightKg} kg.`
        : `Hmotnosť ${weightKg} kg. ${rate ? "" : "Cenu dopravy potvrdíme e-mailom."}`,
      priceEur: rate?.priceEur ?? null,
    },
  ];
}
