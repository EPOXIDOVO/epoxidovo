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
  /** true = zásielka ide na palete (nad rámec kuriérskych pásiem). */
  paleta?: boolean;
}

/**
 * Doprava podľa hmotnosti — sadzby prevzaté z konkurencie montana.sk
 * (predáva tie isté Sika materiály; tekuté materiály = farby/penetrácie/epoxidy
 * posiela kuriérom SDS podľa hmotnosti). User 2026-08-27: „cenu dopravy daj
 * ako má konkurencia".
 *
 * Doprava ZADARMO nad 100 € (do 30 kg). Nad 53 kg → paleta (PALETOVE_PASMA).
 * Osobný odber je vždy zadarmo.
 */
export const FREE_SHIPPING_MIN_EUR = 100;
export const FREE_SHIPPING_MAX_KG = 30;

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

/** Nad túto hmotnosť už kuriérske pásma nesiahajú → paleta. */
export const KURIER_MAX_KG = SHIPPING_RATES[SHIPPING_RATES.length - 1].maxKg;

export interface PaletovePasmo {
  /** Horná hranica pásma v kg; null = posledné, otvorené pásmo. */
  maxKg: number | null;
  /** Popis pásma do UI, napr. „do 150 kg". */
  label: string;
  /** Cena v EUR, alebo null = ešte nie je nacenená (dopĺňa majiteľ). */
  priceEur: number | null;
}

/**
 * Paletová preprava nad 53 kg.
 *
 * Ceny sú priemer TROCH NAJLACNEJŠÍCH slovenských e-shopov, ktoré paletové
 * sadzby zverejňujú (prieskum 2026-08-30):
 *   do 150 kg — Moderné stavebniny 22 € · Hornbach 23,90 € · OBI 29,90 €
 *   do 300 kg — OBI 29,90 € · Moderné stavebniny 30 € · Hornbach 34,90 €
 *   nad 300 kg — Hornbach 44,90 € · Moderné stavebniny 50 € · Hornbach 54,90 €
 * Najbližšia konkurencia (epoxidy.sk) pýta 40,80 € už od 50 kg a 55,20 € pri
 * 120 kg — sme teda pod polovicou.
 *
 * ⚠️ Toto je cena PRE ZÁKAZNÍKA, nie náš náklad. Cenníková sadzba dopravcu
 * (SDS 2025) je pri 100–150 kg 48,92–64,91 € bez DPH, takže bez zmluvnej
 * sadzby na palety každá zásielka dotuje ~30–50 €. Buď zmluva s GEIS/SDS
 * (Moderné stavebniny vozia cez GEIS), alebo tieto čísla zdvihnúť.
 *
 * Zmena ceny = prepísať číslo tu; košík, súčet aj platba kartou sa riadia
 * podľa neho. `priceEur: null` znamená „cenu potvrdíme e-mailom" (PALETA_INFO).
 */
export const PALETOVE_PASMA: PaletovePasmo[] = [
  { maxKg: 150, label: "do 150 kg", priceEur: 25 },
  { maxKg: 300, label: "do 300 kg", priceEur: 32 },
  { maxKg: null, label: "nad 300 kg", priceEur: 50 },
];

/** Pásmo pre danú hmotnosť; posledné pásmo je otvorené, vždy niečo vráti. */
export function getPaletovePasmo(weightKg: number): PaletovePasmo {
  return (
    PALETOVE_PASMA.find((p) => p.maxKg == null || weightKg <= p.maxKg) ??
    PALETOVE_PASMA[PALETOVE_PASMA.length - 1]
  );
}

/**
 * Presne to, čo reálne robíme podľa obchodných podmienok (čl. IV) — zákazník
 * objednávku dokončí, dopravu odsúhlasí e-mailom a bez súhlasu neplatí nič.
 * Používaj túto vetu všade, kde sa ťažká zásielka spomína.
 */
export const PALETA_INFO =
  "Cenu dopravy potvrdíme e-mailom pred expedíciou a odošleme až po tvojom súhlase — bez odsúhlasenia dopravu neúčtujeme.";

/**
 * JEDINÁ pravdivá formulácia o doprave zadarmo. Platí SÚČASNE cena aj
 * hmotnosť — do 2026-08 sa po webe váľali tri rôzne sľuby („doprava v cene",
 * „zdarma nad 100 €" bez limitu kg, a reálne pravidlo). Ak meníš pravidlo,
 * meň ho tu a nikde inde text nepíš ručne.
 */
const ZADARMO_KRATKO = `Doprava zdarma nad ${FREE_SHIPPING_MIN_EUR} € do ${FREE_SHIPPING_MAX_KG} kg`;
const ZADARMO_TAZSIE =
  "Ťažšie zásielky účtujeme podľa hmotnosti — cenu potvrdíme e-mailom pred expedíciou.";

export const DOPRAVA_ZADARMO = {
  minEur: FREE_SHIPPING_MIN_EUR,
  maxKg: FREE_SHIPPING_MAX_KG,
  /** Krátko do trust badge / prúžku. */
  kratko: ZADARMO_KRATKO,
  /** Dovetok pre ťažšie zásielky — samostatne, keď je nadpis už krátky. */
  tazsie: ZADARMO_TAZSIE,
  /** Celá veta — všade, kde je miesto na obe časti naraz. */
  veta: `${ZADARMO_KRATKO}. ${ZADARMO_TAZSIE}`,
} as const;

/** Lehota dodania podľa obchodných podmienok (čl. IV) — nevymýšľaj inú. */
export const DODANIE_LEHOTA =
  "dodanie do 7 pracovných dní, miešané odtiene do 14";

/** Má objednávka nárok na dopravu zadarmo? Cena AJ hmotnosť naraz. */
export function hasFreeShipping(weightKg: number, subtotalEur: number): boolean {
  return subtotalEur >= FREE_SHIPPING_MIN_EUR && weightKg <= FREE_SHIPPING_MAX_KG;
}

export const PICKUP_ADDRESS = "Školská 480, 034 96 Komjatná";

export function getShippingOptions(
  weightKg: number,
  subtotalEur: number,
): ShippingOption[] {
  const hm = Math.round(weightKg * 10) / 10;
  let kurierPrice: number | null;
  let kurierDesc: string;
  let kurierLabel = "Kuriér";
  let paleta = false;
  if (hasFreeShipping(weightKg, subtotalEur)) {
    kurierPrice = 0;
    kurierDesc = `Doprava ZADARMO — objednávka nad ${FREE_SHIPPING_MIN_EUR} € (do ${FREE_SHIPPING_MAX_KG} kg). Hmotnosť ${hm} kg.`;
  } else {
    const rate = SHIPPING_RATES.find((r) => weightKg <= r.maxKg);
    if (rate) {
      kurierPrice = rate.priceEur;
      kurierDesc = `Kuriér DPD / GLS / SDS. Hmotnosť ${hm} kg. Doručenie do 2–4 dní.`;
    } else {
      // Nad 53 kg kuriér neberie — paleta. Cena z PALETOVE_PASMA, kým ju
      // majiteľ nedoplní, ostáva null a potvrdzujeme ju e-mailom.
      paleta = true;
      kurierLabel = "Paletová preprava";
      const pasmo = getPaletovePasmo(weightKg);
      kurierPrice = pasmo.priceEur;
      kurierDesc =
        pasmo.priceEur != null
          ? `Preprava na palete (${pasmo.label}). Hmotnosť ${hm} kg. Termín potvrdíme e-mailom.`
          : `Ťažká zásielka ${hm} kg (${pasmo.label}) — preprava na palete. ${PALETA_INFO}`;
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
      label: kurierLabel,
      description: kurierDesc,
      priceEur: kurierPrice,
      paleta,
    },
  ];
}
