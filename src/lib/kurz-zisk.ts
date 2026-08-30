/**
 * Model zárobku pre landing kurzu — „koľko zarobíš z jednej zákazky".
 *
 * Pre každý typ podlahy počítame tri čísla:
 *  - PREDAJ: reálna trhová cena €/m², za ktorú EPOXIDOVO podlahu predáva
 *    (rovnaké „od" ceny ako na webe) — toľko vyfakturuje aj absolvent.
 *  - MATERIÁL: absolventská cena = náš nákup + ABSOLVENT_MARZA. Absolvent kupuje
 *    materiál u nás lacnejšie než bežný zákazník (ten platí BEZNA_MARZA), a my aj
 *    tak zarobíme na každom balení. Nákupné ceny €/m² sú z CRM cenotvorby.
 *  - ZOSTANE: predaj − materiál = jeho hrubý zisk (jeho práca a réžia).
 *
 * Marže sú počítané ako podiel z predajnej ceny (nie prirážka na nákup) —
 * rovnako ako v CRM: predaj = nákup / (1 − marža).
 *
 * Nákupné ceny doplnené z CRM cenotvorby 2026-08-30 (epoxidovo-typy-podlah.json):
 * Mistral = Arturo Mistral (EP 6200 + Mistral + PU 7310), Concrete Look =
 * Arturo Betón Look (EP 6200 + PU 2030 + PU 7310).
 */
import { KURZ } from "@/content/kurz";

/** Naša marža na materiáli, ktorý absolvent kúpi u nás (strop majiteľa: 19 %). */
export const ABSOLVENT_MARZA = 0.18;
/** Bežná e-shop marža na čistom materiáli (bez realizácie) — na porovnanie. */
export const BEZNA_MARZA = 0.45;

export type TypSlug =
  | "metalicke"
  | "mramorove"
  | "jednofarebne"
  | "chipsove"
  | "mistral"
  | "beton-look";

export interface TypPodlahy {
  slug: TypSlug;
  label: string;
  /** Predajná cena zákazníkovi €/m² (trhová „od" cena z webu). */
  predajEurM2: number;
  /** Náš nákup materiálu €/m² s DPH (z CRM). null = zatiaľ nedoplnené. */
  nakupMaterialEurM2: number | null;
}

/** Poradie = poradie v prepínači. Popredné typy sú pripravené, posledné dva čakajú. */
export const TYPY: TypPodlahy[] = [
  { slug: "metalicke", label: "Metalická", predajEurM2: 129, nakupMaterialEurM2: 49.36 },
  { slug: "mramorove", label: "Mramorová", predajEurM2: 139, nakupMaterialEurM2: 49.36 },
  { slug: "jednofarebne", label: "Jednofarebná", predajEurM2: 59, nakupMaterialEurM2: 14.29 },
  { slug: "chipsove", label: "Chipsová", predajEurM2: 49, nakupMaterialEurM2: 15.1 },
  { slug: "mistral", label: "Mistral", predajEurM2: 104, nakupMaterialEurM2: 49.2 },
  { slug: "beton-look", label: "Concrete Look", predajEurM2: 99, nakupMaterialEurM2: 48.23 },
];

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Absolventská cena materiálu €/m² = nákup s maržou ABSOLVENT_MARZA. */
export function absolventMaterialEurM2(nakup: number): number {
  return r2(nakup / (1 - ABSOLVENT_MARZA));
}

/** Bežná e-shop cena materiálu €/m² (marža BEZNA_MARZA) — na porovnanie úspory. */
export function beznaMaterialEurM2(nakup: number): number {
  return r2(nakup / (1 - BEZNA_MARZA));
}

export interface ZiskVysledok {
  plochaM2: number;
  predajEur: number;
  materialEur: number;
  hrubaMarzaEur: number;
  hrubaMarzaPercent: number;
  /** Na 1 m² — pre porovnania a rozpad. */
  predajM2: number;
  materialM2: number;
  marzaM2: number;
  /** Bežná (45 %) cena materiálu a úspora oproti absolventskej — na 1 m². */
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

/** Zisk pre daný typ a plochu. Vráti null, ak typ nemá doplnený nákup materiálu. */
export function spocitajZisk(plochaM2: number, typ: TypPodlahy): ZiskVysledok | null {
  if (typ.nakupMaterialEurM2 == null) return null;
  const plocha = Math.max(1, Math.round(plochaM2));
  const predajM2 = typ.predajEurM2;
  const materialM2 = absolventMaterialEurM2(typ.nakupMaterialEurM2);
  const beznaM2 = beznaMaterialEurM2(typ.nakupMaterialEurM2);
  const marzaM2 = r2(predajM2 - materialM2);
  const predaj = r2(plocha * predajM2);
  const material = r2(plocha * materialM2);
  const marza = r2(predaj - material);
  return {
    plochaM2: plocha,
    predajEur: predaj,
    materialEur: material,
    hrubaMarzaEur: marza,
    hrubaMarzaPercent: predaj > 0 ? Math.round((marza / predaj) * 1000) / 10 : 0,
    predajM2,
    materialM2,
    marzaM2,
    beznaMaterialM2: beznaM2,
    usporaMaterialM2: r2(beznaM2 - materialM2),
    dniRealizacie: odhadDni(plocha),
    navratnostM2: Math.ceil(KURZ.priceStandard / Math.max(1, marzaM2)),
  };
}

/** Dáta pre graf „zisk podľa počtu podláh" — typická garáž/izba 30 m². */
export function seriaZisku(
  typ: TypPodlahy,
  plochaJednejPodlahyM2 = 30,
  pocty: number[] = [1, 2, 3, 5, 8, 12],
) {
  return pocty.map((n) => {
    const r = spocitajZisk(n * plochaJednejPodlahyM2, typ);
    return {
      pocet: n,
      plocha: n * plochaJednejPodlahyM2,
      predaj: r?.predajEur ?? 0,
      material: r?.materialEur ?? 0,
      marza: r?.hrubaMarzaEur ?? 0,
    };
  });
}
