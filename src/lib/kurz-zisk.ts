/**
 * Model zárobku pre landing kurzu — „koľko zarobíš z jednej metalickej podlahy".
 *
 * Predaj: 149 €/m² (metalická podlaha, cena zákazníkovi).
 * Nákup materiálu: VŽDY z reálnej skladby konfigurátora (SYSTEMY → metalik-premium:
 * TopStone EP02 2×, EP11 Metallic, EP22 Plus 2×) a z AKTUÁLNYCH cien v našom
 * e-shope (getMaterial → cena_eur_s_dph). Keď sa zmení cena v e-shope, zmení
 * sa aj kalkulačka — nič nie je natvrdo.
 *
 * Balenia sa počítajú cez prepocitaj() (zaokrúhlenie nahor + 10 % rezerva)
 * — rovnako ako v konfigurátore, aby si absolvent videl to isté číslo, aké
 * mu vyjde pri reálnom nákupe.
 */
import { getSystem } from "@/lib/konfigurator/systemy";
import { postavSkladbu, PREDVOLENA_VOLBA, type Volba } from "@/lib/konfigurator/rules";
import { prepocitaj } from "@/lib/konfigurator/vypocet";
import { getMaterial } from "@/lib/materialy";
import { KURZ } from "@/content/kurz";

export const PREDAJ_EUR_M2 = 149;
export const SYSTEM_ID = "metalik-premium";

export interface MaterialRiadok {
  nazov: string;
  produkt: string;
  sku: string;
  spotrebaKgM2: number | null;
  cenaBalenie: number | null;
  balenieKg: number;
  /** €/m² pri spojitej spotrebe (bez zaokrúhlenia na balenia) */
  eurM2: number | null;
}

export interface ZiskVysledok {
  plochaM2: number;
  predajEur: number;
  /** materiál presne na plochu (spojite, bez balení) — pre grafy */
  materialSpojiteEur: number;
  /** materiál pri reálnom nákupe (celé balenia + 10 % rezerva) */
  materialBaleniaEur: number;
  hrubaMarzaEur: number;
  hrubaMarzaPercent: number;
  eurNaM2Material: number;
  eurNaM2Marza: number;
  riadky: MaterialRiadok[];
  dniRealizacie: number;
  /** po koľkých m² sa vráti kurz Štandard */
  navratnostM2: number;
}

/** Spojitá cena materiálu na 1 m² podľa skladby a e-shop cien. */
export function materialEurM2(): { spolu: number; riadky: MaterialRiadok[] } {
  const system = getSystem(SYSTEM_ID);
  if (!system) return { spolu: 0, riadky: [] };
  const riadky: MaterialRiadok[] = system.vrstvy.map((v) => {
    const m = getMaterial(v.produktSku);
    const cena = m?.cena_eur_s_dph ?? null;
    const eurM2 =
      cena != null && v.spotrebaKgM2 != null && v.velkostBaleniaKg > 0
        ? (cena / v.velkostBaleniaKg) * v.spotrebaKgM2
        : null;
    return {
      nazov: v.nazov,
      produkt: v.produktNazov,
      sku: v.produktSku,
      spotrebaKgM2: v.spotrebaKgM2,
      cenaBalenie: cena,
      balenieKg: v.velkostBaleniaKg,
      eurM2: eurM2 != null ? Math.round(eurM2 * 100) / 100 : null,
    };
  });
  const spolu = Math.round(riadky.reduce((s, r) => s + (r.eurM2 ?? 0), 0) * 100) / 100;
  return { spolu, riadky };
}

export function spocitajZisk(plochaM2: number): ZiskVysledok {
  const plocha = Math.max(1, Math.round(plochaM2));
  const system = getSystem(SYSTEM_ID)!;
  const volba: Volba = {
    ...PREDVOLENA_VOLBA,
    co: "podlaha",
    kde: "interier",
    priestor: "byt_dom",
    podklad: "beton",
    stav: "rovny",
    vzhlad: "metalik",
    plochaM2: plocha,
  };
  const skladba = postavSkladbu(volba, system);
  const vysledok = prepocitaj(skladba, volba);
  const { spolu: m2Material, riadky } = materialEurM2();

  const predaj = plocha * PREDAJ_EUR_M2;
  const materialSpojite = Math.round(plocha * m2Material * 100) / 100;
  const materialBalenia = vysledok.cenaMaterialu;
  const marza = Math.round((predaj - materialBalenia) * 100) / 100;
  return {
    plochaM2: plocha,
    predajEur: predaj,
    materialSpojiteEur: materialSpojite,
    materialBaleniaEur: materialBalenia,
    hrubaMarzaEur: marza,
    hrubaMarzaPercent: predaj > 0 ? Math.round((marza / predaj) * 1000) / 10 : 0,
    eurNaM2Material: m2Material,
    eurNaM2Marza: Math.round((PREDAJ_EUR_M2 - m2Material) * 100) / 100,
    riadky,
    dniRealizacie: vysledok.dniRealizacie,
    navratnostM2: Math.ceil(KURZ.priceStandard / Math.max(1, PREDAJ_EUR_M2 - m2Material)),
  };
}

/** Dáta pre graf „zisk podľa počtu podláh" — typická garáž/izba 30 m². */
export function seriaZisku(plochaJednejPodlahyM2 = 30, pocty: number[] = [1, 2, 3, 5, 8, 12]) {
  return pocty.map((n) => {
    const r = spocitajZisk(n * plochaJednejPodlahyM2);
    return { pocet: n, plocha: r.plochaM2, predaj: r.predajEur, material: r.materialBaleniaEur, marza: r.hrubaMarzaEur };
  });
}
