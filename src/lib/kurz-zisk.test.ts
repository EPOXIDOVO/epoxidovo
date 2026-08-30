import { describe, it, expect } from "vitest";
import {
  spocitajZisk,
  teoretickaEurM2,
  marzaEurM2,
  TYPY,
  absolventMaterialEurM2,
  beznaMaterialEurM2,
  ABSOLVENT_MARZA,
  type TypSlug,
} from "@/lib/kurz-zisk";

const typ = (slug: TypSlug) => TYPY.find((t) => t.slug === slug)!;

describe("kurz-zisk — celé sudy (kontrolné čísla z CRM 2026-08-30)", () => {
  /**
   * Kontrolná tabuľka z prompt-kurz-realne-cisla.md — musí sedieť do centu.
   * [slug, plocha, balení, nákup, absolventská, príplatok, tržba, zostane, zostane €/m²]
   */
  const TABULKA: [TypSlug, number, number, number, number, number, number, number, number][] = [
    ["jednofarebne", 20, 3, 601.47, 925.34, 485.74, 1665.74, 740.4, 37.02],
    ["jednofarebne", 30, 3, 601.47, 925.34, 265.94, 2035.94, 1110.6, 37.02],
    ["jednofarebne", 50, 4, 811.8, 1248.92, 149.92, 3099.92, 1851.0, 37.02],
    ["chipsove", 30, 3, 625.77, 962.72, 265.94, 1735.94, 773.22, 25.77],
    ["metalicke", 20, 6, 1570.71, 2416.48, 897.82, 3477.82, 1061.34, 53.07],
    ["metalicke", 30, 7, 1847.46, 2842.25, 564.25, 4434.25, 1592.0, 53.07],
    ["metalicke", 50, 10, 2677.71, 4119.55, 322.88, 6772.88, 2653.33, 53.07],
    ["mramorove", 20, 6, 1570.71, 2416.48, 897.82, 3677.82, 1261.34, 63.07],
  ];

  it.each(TABULKA)("%s %d m²: balení %d, nákup %s, absolventská %s, príplatok %s, tržba %s, zostane %s (%s €/m²)",
    (slug, plocha, baleni, nakup, absolventska, priplatok, trzba, zostane, zostaneM2) => {
      const r = spocitajZisk(plocha, typ(slug));
      expect(r.baleniaSpolu).toBe(baleni);
      expect(r.nakupEur).toBeCloseTo(nakup, 2);
      expect(r.materialEur).toBeCloseTo(absolventska, 2);
      expect(r.priplatokEur).toBeCloseTo(priplatok, 2);
      expect(r.predajEur).toBeCloseTo(trzba, 2);
      expect(r.hrubaMarzaEur).toBeCloseTo(zostane, 2);
      expect(r.marzaM2).toBeCloseTo(zostaneM2, 2);
    });

  it("invariant: „zostane €/m²' je pri každej ploche rovnaké pre všetky typy", () => {
    // Hodnoty pri marži 35 % (majiteľ 2026-08-30). Pri zmene ABSOLVENT_MARZA
    // sa prepočítajú — invariant nižšie ich kontroluje aj bez tabuľky.
    const ocakavane: Record<TypSlug, number> = {
      jednofarebne: 37.02, chipsove: 25.77, metalicke: 53.07,
      mramorove: 63.07, mistral: 28.33, "beton-look": 24.82,
    };
    const ABS = 1 - ABSOLVENT_MARZA;
    for (const t of TYPY) {
      expect(marzaEurM2(t), t.slug).toBeCloseTo(ocakavane[t.slug], 2);
      // presný (nezaokrúhlený) invariant: zostane = (predaj − teor/(1−marža)) × plocha
      const exactM2 = t.predajEurM2 - teoretickaEurM2(t) / ABS;
      for (const plocha of [20, 30, 50, 100, 200, 500, 1000, 2000]) {
        const r = spocitajZisk(plocha, t);
        expect(Math.abs(r.hrubaMarzaEur - exactM2 * plocha), `${t.slug}@${plocha}`).toBeLessThan(0.05);
      }
    }
  });

  it("teoretická spotreba €/m² sedí s CRM hodnotami", () => {
    expect(teoretickaEurM2(typ("jednofarebne"))).toBeCloseTo(14.29, 2);
    expect(teoretickaEurM2(typ("chipsove"))).toBeCloseTo(15.1, 2);
    expect(teoretickaEurM2(typ("metalicke"))).toBeCloseTo(49.36, 2);
    expect(teoretickaEurM2(typ("mistral"))).toBeCloseTo(49.19, 2);
    expect(teoretickaEurM2(typ("beton-look"))).toBeCloseTo(48.21, 2);
  });

  it("epsilon: 50 m² jednofarebná × 264 je presne 2,7 balenia → 3, nie 4", () => {
    const r = spocitajZisk(50, typ("jednofarebne"));
    const s264 = r.riadky.find((x) => x.sku === "SIKAFLOOR-264-30")!;
    expect(s264.baleni).toBe(3);
  });

  it("ručná položka (chipsy) nevstupuje do balení ani do príplatku", () => {
    const ch = spocitajZisk(30, typ("chipsove"));
    const jf = spocitajZisk(30, typ("jednofarebne"));
    expect(ch.baleniaSpolu).toBe(jf.baleniaSpolu);
    expect(ch.priplatokEur).toBeCloseTo(jf.priplatokEur, 2);
  });

  it("absolventská cena je lacnejšia než bežná e-shop cena", () => {
    const nakup = 49.36;
    expect(absolventMaterialEurM2(nakup)).toBeCloseTo(75.94, 1);
    expect(beznaMaterialEurM2(nakup)).toBeCloseTo(89.75, 1);
    // Výhoda absolventa musí ostať kladná, nech sa marža nastaví akokoľvek.
    expect(absolventMaterialEurM2(nakup)).toBeLessThan(beznaMaterialEurM2(nakup));
  });
});
