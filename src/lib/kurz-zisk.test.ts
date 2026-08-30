import { describe, it, expect } from "vitest";
import {
  spocitajZisk,
  teoretickaEurM2,
  marzaEurM2,
  TYPY,
  absolventMaterialEurM2,
  beznaMaterialEurM2,
  type TypSlug,
} from "@/lib/kurz-zisk";

const typ = (slug: TypSlug) => TYPY.find((t) => t.slug === slug)!;

describe("kurz-zisk — celé sudy (kontrolné čísla z CRM 2026-08-30)", () => {
  /**
   * Kontrolná tabuľka z prompt-kurz-realne-cisla.md — musí sedieť do centu.
   * [slug, plocha, balení, nákup, absolventská, príplatok, tržba, zostane, zostane €/m²]
   */
  const TABULKA: [TypSlug, number, number, number, number, number, number, number, number][] = [
    ["jednofarebne", 20, 3, 601.47, 733.5, 385.04, 1565.04, 831.54, 41.58],
    ["jednofarebne", 30, 3, 601.47, 733.5, 210.8, 1980.8, 1247.3, 41.58],
    ["jednofarebne", 50, 4, 811.8, 990.0, 118.84, 3068.84, 2078.84, 41.58],
    ["chipsove", 30, 3, 625.77, 763.13, 210.8, 1680.8, 917.67, 30.59],
    ["metalicke", 20, 6, 1570.71, 1915.5, 711.68, 3291.68, 1376.18, 68.81],
    ["metalicke", 30, 7, 1847.46, 2253.0, 447.27, 4317.27, 2064.27, 68.81],
    ["metalicke", 50, 10, 2677.71, 3265.5, 255.94, 6705.94, 3440.44, 68.81],
    ["mramorove", 20, 6, 1570.71, 1915.5, 711.68, 3491.68, 1576.18, 78.81],
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
    // Pozn.: zadanie uvádza Mistral 44,01 a Concrete 40,21, ale to je dvojité
    // zaokrúhlenie (teoretická na centy → potom delenie). Pri zaokrúhlení až
    // na konci (pravidlo zo zadania) vychádza 44,02 resp. 40,20.
    const ocakavane: Record<TypSlug, number> = {
      jednofarebne: 41.58, chipsove: 30.59, metalicke: 68.81,
      mramorove: 78.81, mistral: 44.02, "beton-look": 40.2,
    };
    const ABS = 0.82;
    for (const t of TYPY) {
      expect(marzaEurM2(t), t.slug).toBeCloseTo(ocakavane[t.slug], 2);
      // presný (nezaokrúhlený) invariant: zostane = (predaj − teor/0.82) × plocha
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
    expect(absolventMaterialEurM2(nakup)).toBeCloseTo(60.2, 1);
    expect(beznaMaterialEurM2(nakup)).toBeCloseTo(89.75, 1);
  });
});
