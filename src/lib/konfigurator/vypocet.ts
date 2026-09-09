/**
 * Výpočet spotreby, balení a ceny pre konfigurátor.
 *
 * Balenia sa VŽDY zaokrúhľujú nahor — materiál sa nedá odliať. Pri každej
 * položke vraciame aj `zvysiKg`, aby zákazník videl, koľko mu ostane;
 * buduje to dôveru a znižuje reklamácie.
 */

import { getMaterial } from "@/lib/materialy";
import { vsetkyOdtiene, type SkladbaPolozka, type Volba } from "./rules";

export type Riadok = {
  poradie: number;
  nazov: string;
  produktSku: string;
  produktNazov: string;
  bezMaterialu: boolean;
  /** kg/m² (pri nivelácii už prenásobené hrúbkou) */
  spotrebaKgM2: number | null;
  potrebaKg: number | null;
  velkostBaleniaKg: number;
  pocetBaleni: number | null;
  zvysiKg: number | null;
  cenaZaBalenie: number | null;
  cenaSpolu: number | null;
  poznamka?: string;
  auto?: boolean;
  prestavkaHodiny?: number;
};

/** Plocha schodiska z počtu stupňov a šírky: nášľap + podstupnica ≈ 0,75 m². */
export function plochaSchodov(pocetStupnov: number, sirkaCm: number): number {
  return Math.round(pocetStupnov * (sirkaCm / 100) * 0.75 * 100) / 100;
}

/** Plocha, s ktorou sa reálne počíta (schody sa dopočítajú). */
export function efektivnaPlocha(volba: Volba): number | null {
  if (volba.co === "schody") {
    if (!volba.pocetStupnov || !volba.sirkaSchodovCm) return null;
    return plochaSchodov(volba.pocetStupnov, volba.sirkaSchodovCm);
  }
  return volba.plochaM2 && volba.plochaM2 > 0 ? volba.plochaM2 : null;
}

export function prepocitaj(skladba: SkladbaPolozka[], volba: Volba): {
  riadky: Riadok[];
  plochaSRezervou: number;
  cenaMaterialu: number;
  cenaSluzieb: number;
  cenaSpolu: number;
  maNaDopyt: boolean;
  dniRealizacie: number;
} {
  const plocha = efektivnaPlocha(volba) ?? 0;
  const plochaSRezervou = plocha * (1 + volba.rezervaPercent / 100);

  const riadky: Riadok[] = skladba.map((v) => {
    if (v.bezMaterialu || v.spotrebaKgM2 == null) {
      return {
        poradie: v.poradie,
        nazov: v.nazov,
        produktSku: v.produktSku,
        produktNazov: v.produktNazov,
        bezMaterialu: !!v.bezMaterialu,
        spotrebaKgM2: null,
        potrebaKg: null,
        velkostBaleniaKg: v.velkostBaleniaKg,
        pocetBaleni: null,
        zvysiKg: null,
        cenaZaBalenie: null,
        cenaSpolu: null,
        poznamka: v.poznamka,
        auto: v.auto,
        prestavkaHodiny: v.prestavkaHodiny,
      };
    }
    // nivelácia: spotreba je kg/m²/mm → prenásob hrúbkou
    const spotreba = v.naMm ? v.spotrebaKgM2 * volba.hrubkaNivelacieMm : v.spotrebaKgM2;
    const potrebaKg = Math.round(spotreba * plochaSRezervou * 10) / 10;
    /*
     * Sudy pri viacerých odtieňoch. Z jedného suda sa druhá farba namiešať
     * nedá, takže KAŽDÝ odtieň potrebuje aspoň jedno celé balenie.
     *
     * Majiteľ 2026-09-09: „ak to je na 20 m², musíš doplácať sud… ak vieme,
     * že 1 sud je na 25 m² a je to 70, musíme vziať 3 a ide to teda o sud
     * hore. Pokiaľ je to 100 m² a dávam tam 5 sudov, problém nie je —
     * viem z každého zobrať."
     *
     * Preto: počet balení = max(spotreba zaokrúhlená nahor, počet odtieňov).
     * Na 100 m² pri 5 sudoch sa teda nič nepripočíta, na 20 m² pri dvoch
     * odtieňoch pribudne jeden. Cena ide nákupná, marža sa nepridáva —
     * tento konfigurátor ju nepočíta vôbec.
     */
    const zakladBaleni = v.velkostBaleniaKg > 0 ? Math.ceil(potrebaKg / v.velkostBaleniaKg) : 0;
    const pocetOdtienov = v.farebna ? Math.max(1, vsetkyOdtiene(volba).length) : 1;
    const pocetBaleni = Math.max(zakladBaleni, v.farebna ? pocetOdtienov : 0);
    const baleniNavyseZaOdtiene = Math.max(0, pocetBaleni - zakladBaleni);
    const kupenychKg = Math.round(pocetBaleni * v.velkostBaleniaKg * 10) / 10;
    const cenaZaBalenie = getMaterial(v.produktSku)?.cena_eur_s_dph ?? null;
    return {
      poradie: v.poradie,
      nazov: v.nazov,
      produktSku: v.produktSku,
      produktNazov: v.produktNazov,
      bezMaterialu: false,
      spotrebaKgM2: Math.round(spotreba * 100) / 100,
      potrebaKg,
      velkostBaleniaKg: v.velkostBaleniaKg,
      pocetBaleni,
      zvysiKg: Math.round((kupenychKg - potrebaKg) * 10) / 10,
      cenaZaBalenie,
      cenaSpolu: cenaZaBalenie != null ? Math.round(cenaZaBalenie * pocetBaleni * 100) / 100 : null,
      poznamka:
        baleniNavyseZaOdtiene > 0
          ? `${baleniNavyseZaOdtiene === 1 ? "Jedno balenie navyše" : `${baleniNavyseZaOdtiene} balenia navyše`} — každý odtieň sa musí kúpiť celý${v.poznamka ? ` · ${v.poznamka}` : ""}`
          : v.poznamka,
      auto: v.auto,
      prestavkaHodiny: v.prestavkaHodiny,
    };
  });

  const cenaMaterialu =
    Math.round(riadky.reduce((s, r) => s + (r.cenaSpolu ?? 0), 0) * 100) / 100;
  // Zošívanie prasklín sa už neoceňuje v konfigurátore — počet ani hĺbku
  // zákazník spoľahlivo neurčí, docení sa pri obhliadke.
  const cenaSluzieb = 0;
  // technologické prestávky → dni (8 h pracovný deň, prestávky bežia aj cez noc)
  const hodiny = riadky.reduce((s, r) => s + (r.prestavkaHodiny ?? 0), 0);
  const dniRealizacie = Math.max(1, Math.ceil(hodiny / 24) + 1);

  return {
    riadky,
    plochaSRezervou: Math.round(plochaSRezervou * 100) / 100,
    cenaMaterialu,
    cenaSluzieb,
    cenaSpolu: Math.round((cenaMaterialu + cenaSluzieb) * 100) / 100,
    maNaDopyt: riadky.some((r) => !r.bezMaterialu && r.cenaSpolu == null),
    dniRealizacie,
  };
}

export const fmtEur = (n: number) =>
  new Intl.NumberFormat("sk-SK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
