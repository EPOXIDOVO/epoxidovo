import { describe, it, expect } from "vitest";
import {
  spocitajZisk,
  seriaZisku,
  TYPY,
  absolventMaterialEurM2,
  beznaMaterialEurM2,
} from "@/lib/kurz-zisk";

const metalicka = TYPY.find((t) => t.slug === "metalicke")!;
const mistral = TYPY.find((t) => t.slug === "mistral")!;

describe("kurz-zisk — model zárobku z jednej zákazky", () => {
  it("absolventská cena je lacnejšia než bežná e-shop cena", () => {
    const nakup = 49.36;
    const abs = absolventMaterialEurM2(nakup);
    const bezna = beznaMaterialEurM2(nakup);
    expect(abs).toBeGreaterThan(nakup); // stále je tam naša marža
    expect(abs).toBeLessThan(bezna); // ale menej než bežných 45 %
    expect(abs).toBeCloseTo(60.2, 1); // 49.36 / 0.82
    expect(bezna).toBeCloseTo(89.75, 1); // 49.36 / 0.55
  });

  it("30 m² metalická: predaj 3870 €, marža kladná, návratnosť kladná", () => {
    const r = spocitajZisk(30, metalicka)!;
    expect(r.predajEur).toBe(3870); // 30 × 129
    expect(r.materialM2).toBeCloseTo(60.2, 1);
    expect(r.marzaM2).toBeCloseTo(68.8, 1); // 129 − 60.20
    expect(r.hrubaMarzaEur).toBeGreaterThan(0);
    expect(r.usporaMaterialM2).toBeGreaterThan(0);
    expect(r.navratnostM2).toBeGreaterThan(0);
  });

  it("Mistral (Arturo): predaj 104, zarobíš ~44 €/m² — dáta z CRM 2026-08-30", () => {
    const r = spocitajZisk(30, mistral)!;
    expect(r).not.toBeNull();
    expect(r.predajM2).toBe(104);
    expect(r.materialM2).toBeCloseTo(60.0, 1); // 49.20 / 0.82
    expect(r.marzaM2).toBeCloseTo(44.0, 1);
  });

  it("Concrete Look (Arturo): predaj 99, zarobíš ~40,18 €/m²", () => {
    const beton = TYPY.find((t) => t.slug === "beton-look")!;
    const r = spocitajZisk(30, beton)!;
    expect(r.materialM2).toBeCloseTo(58.82, 1); // 48.23 / 0.82
    expect(r.marzaM2).toBeCloseTo(40.18, 1);
  });

  it("séria rastie monotónne", () => {
    const s = seriaZisku(metalicka);
    for (let i = 1; i < s.length; i++) expect(s[i].marza).toBeGreaterThan(s[i - 1].marza);
  });
});
