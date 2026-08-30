/**
 * Model zárobku pre landing kurzu — „koľko zarobíš z jednej zákazky".
 *
 * Materiál sa počíta na CELÉ BALENIA (sudy), nie na presnú spotrebu — pol
 * suda sa kúpiť nedá. Pravidlo z CRM (majiteľ 2026-08-30): zaokrúhľuje sa
 * na sud nahor a celé sudy sa účtujú zákazníkovi. Preto sa menia OBE strany:
 *
 *   1. materiál   = Σ (celé balenia × cena balenia)          ← ceil
 *   2. príplatok  = (materiál − teoretická spotreba) / (1 − ABSOLVENT_MARZA)
 *   3. tržba      = predaj €/m² × plocha + príplatok
 *   4. materiál pre absolventa = materiál / (1 − ABSOLVENT_MARZA)
 *   5. zostane    = tržba − materiál pre absolventa
 *
 * Vďaka 2+3 je „zostane €/m²" rovnaké pri každej ploche (41,58 / 30,59 /
 * 68,81 / 78,81 / 44,01 / 40,21) — a je pravdivé, lebo sudy platí zákazník.
 *
 * Skladby a ceny balení (s DPH — sme neplatiteľ) sú z CRM 2026-08-30
 * (prompt-kurz-realne-cisla.md). Nič sa neodhaduje.
 */
import { KURZ } from "@/content/kurz";

/**
 * Naša marža na materiáli, ktorý absolvent kúpi u nás.
 *
 * Majiteľ 2026-08-30: „daj naše náklady na materiál, iba materiál, a pridaj
 * tam 35 % maržu." Marža je podiel z PREDAJNEJ ceny, rovnako ako všade inde
 * v CRM (predaj = náklad / (1 − marža)), teda náklad × 1,538 — nie náklad
 * + 35 %. Náklad je čistý materiál v celých baleniach s DPH, bez práce.
 *
 * Dopad: kurzista zarobí menej (epoxidy −11 až −16 %, Arturo −36 až −38 %)
 * a jeho výhoda oproti e-shopu klesla z −33 % na −15 %.
 */
export const ABSOLVENT_MARZA = 0.35;
/** Bežná e-shop marža na čistom materiáli (bez realizácie) — na porovnanie. */
export const BEZNA_MARZA = 0.45;

export type TypSlug =
  | "metalicke"
  | "mramorove"
  | "jednofarebne"
  | "chipsove"
  | "mistral"
  | "beton-look";

/** Komponent skladby predávaný v baleniach (sudoch). */
export interface KomponentSkladby {
  sku: string;
  nazov: string;
  spotrebaKgM2: number;
  /** rezerva v % (bežne 8) — vstupuje do kíl PRED zaokrúhlením na balenia */
  rezervaPct: number;
  balenieKg: number;
  /** cena balenia s DPH */
  cenaBalenia: number;
}

/** Ručná položka bez balenia (chipsy) — účtuje sa na m², do sudov nevstupuje. */
export interface RucnaPolozka {
  sku: string;
  nazov: string;
  cenaEurM2: number;
}

export interface TypPodlahy {
  slug: TypSlug;
  label: string;
  /** Predajná cena zákazníkovi €/m² (trhová „od" cena z webu). */
  predajEurM2: number;
  /** Teoretická spotreba materiálu €/m² s rezervou — len na porovnanie/vyhodu. */
  nakupMaterialEurM2: number;
  skladba: KomponentSkladby[];
  rucne?: RucnaPolozka[];
}

/* Zdieľané komponenty (rovnaké SKU = rovnaká cena všade) */
const SIKA_151: KomponentSkladby = { sku: "SIKAFLOOR-151", nazov: "Sikafloor-151 Primer", spotrebaKgM2: 0.45, rezervaPct: 8, balenieKg: 30, cenaBalenia: 180.81 };
const SIKA_264: KomponentSkladby = { sku: "SIKAFLOOR-264-30", nazov: "Sikafloor-264 (2K epoxid)", spotrebaKgM2: 1.5, rezervaPct: 8, balenieKg: 30, cenaBalenia: 210.33 };
const SIKA_3000FX: KomponentSkladby = { sku: "558772", nazov: "Sikafloor-3000 FX (metalická)", spotrebaKgM2: 2.8, rezervaPct: 8, balenieKg: 20, cenaBalenia: 276.75 };
const SIKA_305W: KomponentSkladby = { sku: "717550", nazov: "Sikafloor-305 W Matt (lak)", spotrebaKgM2: 0.15, rezervaPct: 8, balenieKg: 10, cenaBalenia: 282.9 };
const ART_EP6200: KomponentSkladby = { sku: "ART-EP-6200", nazov: "Arturo EP 6200 (penetrácia)", spotrebaKgM2: 0.9, rezervaPct: 8, balenieKg: 25, cenaBalenia: 190.34 };
const ART_MISTRAL: KomponentSkladby = { sku: "ART-MISTRAL", nazov: "Arturo Mistral", spotrebaKgM2: 3.04, rezervaPct: 8, balenieKg: 25, cenaBalenia: 294.28 };
const ART_PU2030: KomponentSkladby = { sku: "ART-PU-2030", nazov: "Arturo PU 2030", spotrebaKgM2: 3.12, rezervaPct: 8, balenieKg: 25, cenaBalenia: 279.52 };
const ART_PU7310: KomponentSkladby = { sku: "ART-PU-7310-2K", nazov: "Arturo PU 7310 (2K lak)", spotrebaKgM2: 0.095, rezervaPct: 8, balenieKg: 10, cenaBalenia: 305.9 };
const CHIPSY: RucnaPolozka = { sku: "180050", nazov: "Chipsy — dekoračný posyp", cenaEurM2: 0.81 };

/** Poradie = poradie v prepínači. */
export const TYPY: TypPodlahy[] = [
  { slug: "metalicke", label: "Metalická", predajEurM2: 129, nakupMaterialEurM2: 49.36, skladba: [SIKA_151, SIKA_3000FX, SIKA_305W] },
  { slug: "mramorove", label: "Mramorová", predajEurM2: 139, nakupMaterialEurM2: 49.36, skladba: [SIKA_151, SIKA_3000FX, SIKA_305W] },
  { slug: "jednofarebne", label: "Jednofarebná", predajEurM2: 59, nakupMaterialEurM2: 14.29, skladba: [SIKA_151, SIKA_264] },
  { slug: "chipsove", label: "Chipsová", predajEurM2: 49, nakupMaterialEurM2: 15.1, skladba: [SIKA_151, SIKA_264], rucne: [CHIPSY] },
  { slug: "mistral", label: "Mistral", predajEurM2: 104, nakupMaterialEurM2: 49.19, skladba: [ART_EP6200, ART_MISTRAL, ART_PU7310] },
  { slug: "beton-look", label: "Concrete Look", predajEurM2: 99, nakupMaterialEurM2: 48.21, skladba: [ART_EP6200, ART_PU2030, ART_PU7310] },
];

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Absolventská (veľkoobchodná) cena z nákupu — marža ABSOLVENT_MARZA. */
export function absolventMaterialEurM2(nakup: number): number {
  return r2(nakup / (1 - ABSOLVENT_MARZA));
}

/** Bežná e-shop cena z nákupu — marža BEZNA_MARZA (na porovnanie úspory). */
export function beznaMaterialEurM2(nakup: number): number {
  return r2(nakup / (1 - BEZNA_MARZA));
}

/** Teoretická spotreba €/m² s rezervou — spojite, bez zaokrúhlenia na sudy. */
export function teoretickaEurM2(typ: TypPodlahy): number {
  const skladba = typ.skladba.reduce((s, k) => {
    const kgNaM2 = k.spotrebaKgM2 * (1 + k.rezervaPct / 100);
    return s + kgNaM2 * (k.cenaBalenia / k.balenieKg);
  }, 0);
  const rucne = (typ.rucne ?? []).reduce((s, p) => s + p.cenaEurM2, 0);
  return skladba + rucne;
}

/** Invariant „zostane €/m²" — rovnaký pri každej ploche. */
export function marzaEurM2(typ: TypPodlahy): number {
  return r2(typ.predajEurM2 - teoretickaEurM2(typ) / (1 - ABSOLVENT_MARZA));
}

export interface BalenieRiadok {
  sku: string;
  nazov: string;
  baleni: number;
  kgTreba: number;
  kgKupene: number;
  cenaEur: number;
}

export interface ZiskVysledok {
  plochaM2: number;
  /** Tržba zákazníkovi = predaj €/m² × plocha + príplatok za celé balenia. */
  predajEur: number;
  zakladEur: number;
  priplatokEur: number;
  /** Absolventská cena materiálu (celé balenia + ručné položky). */
  materialEur: number;
  /** Náš nákup materiálu (celé balenia + ručné položky). */
  nakupEur: number;
  hrubaMarzaEur: number;
  hrubaMarzaPercent: number;
  /** Počet balení (sudov) spolu a koľko kg ostane. */
  baleniaSpolu: number;
  zvysokKg: number;
  riadky: BalenieRiadok[];
  /** Na 1 m² — invariant a porovnania (z teoretickej spotreby). */
  predajM2: number;
  materialM2: number;
  marzaM2: number;
  beznaMaterialM2: number;
  usporaMaterialM2: number;
  dniRealizacie: number;
  /** Po koľkých m² sa vráti kurz Štandard. */
  navratnostM2: number;
}

/** Odhad dní realizácie — technologické prestávky dominujú (2 dni + 1 deň / 60 m²). */
function odhadDni(plocha: number): number {
  return Math.max(2, 2 + Math.ceil(plocha / 60));
}

/**
 * Zisk pre daný typ a plochu — celé balenia.
 * Zaokrúhľovanie: kilá v plnej presnosti, ceil s epsilonom (30,0000001 kg
 * nie sú 2 balenia), eurá až na konci na centy.
 */
export function spocitajZisk(plochaM2: number, typ: TypPodlahy): ZiskVysledok {
  const plocha = Math.max(1, Math.round(plochaM2));

  // Rovnaké SKU vo viacerých vrstvách: najprv sčítať kilá, až potom ceil.
  const poSku = new Map<string, { k: KomponentSkladby; kg: number }>();
  for (const k of typ.skladba) {
    const kg = k.spotrebaKgM2 * (1 + k.rezervaPct / 100) * plocha;
    const cur = poSku.get(k.sku);
    if (cur) cur.kg += kg;
    else poSku.set(k.sku, { k, kg });
  }

  const riadky: BalenieRiadok[] = [];
  let nakup = 0;
  let balenia = 0;
  let zvysok = 0;
  for (const { k, kg } of poSku.values()) {
    const n = Math.ceil(kg / k.balenieKg - 1e-6);
    const kgKupene = n * k.balenieKg;
    riadky.push({ sku: k.sku, nazov: k.nazov, baleni: n, kgTreba: kg, kgKupene, cenaEur: r2(n * k.cenaBalenia) });
    nakup += n * k.cenaBalenia;
    balenia += n;
    zvysok += kgKupene - kg;
  }
  for (const p of typ.rucne ?? []) {
    const cena = p.cenaEurM2 * plocha;
    riadky.push({ sku: p.sku, nazov: p.nazov, baleni: 0, kgTreba: 0, kgKupene: 0, cenaEur: r2(cena) });
    nakup += cena;
  }

  const nakupR = r2(nakup);
  const teorM2 = teoretickaEurM2(typ); // vrátane ručných položiek
  const teorR = r2(teorM2 * plocha);
  const priplatok = r2((nakupR - teorR) / (1 - ABSOLVENT_MARZA));
  const zaklad = r2(typ.predajEurM2 * plocha);
  const trzba = r2(zaklad + priplatok);
  const absolventska = r2(nakupR / (1 - ABSOLVENT_MARZA));
  const zostane = r2(trzba - absolventska);

  const materialM2 = r2(teorM2 / (1 - ABSOLVENT_MARZA));
  const beznaM2 = r2(teorM2 / (1 - BEZNA_MARZA));
  const marzaM2 = marzaEurM2(typ);

  return {
    plochaM2: plocha,
    predajEur: trzba,
    zakladEur: zaklad,
    priplatokEur: priplatok,
    materialEur: absolventska,
    nakupEur: nakupR,
    hrubaMarzaEur: zostane,
    hrubaMarzaPercent: trzba > 0 ? Math.round((zostane / trzba) * 1000) / 10 : 0,
    baleniaSpolu: balenia,
    zvysokKg: Math.round(zvysok),
    riadky,
    predajM2: typ.predajEurM2,
    materialM2,
    marzaM2,
    beznaMaterialM2: beznaM2,
    usporaMaterialM2: r2(beznaM2 - materialM2),
    dniRealizacie: odhadDni(plocha),
    navratnostM2: Math.ceil(KURZ.priceStandard / Math.max(1, marzaM2)),
  };
}
