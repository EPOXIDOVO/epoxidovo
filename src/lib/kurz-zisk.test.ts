import { describe, it, expect } from "vitest";
import { spocitajZisk, materialEurM2, seriaZisku, PREDAJ_EUR_M2 } from "@/lib/kurz-zisk";

describe("kurz-zisk — model zárobku z metalickej podlahy", () => {
  it("materiál na m² vychádza z e-shop cien a skladby konfigurátora", () => {
    const m = materialEurM2();
    expect(m.riadky.length).toBe(3);
    for (const r of m.riadky) {
      expect(r.cenaBalenie).not.toBeNull();
      expect(r.eurM2).toBeGreaterThan(0);
    }
    expect(m.spolu).toBeGreaterThan(30);
    expect(m.spolu).toBeLessThan(PREDAJ_EUR_M2);
  });
  it("30 m² garáž: predaj 4470 €, marža kladná, balenia ≥ spojitá spotreba", () => {
    const r = spocitajZisk(30);
    expect(r.predajEur).toBe(4470);
    expect(r.materialBaleniaEur).toBeGreaterThanOrEqual(r.materialSpojiteEur);
    expect(r.hrubaMarzaEur).toBeGreaterThan(0);
    expect(r.navratnostM2).toBeGreaterThan(0);
  });
  it("séria rastie monotónne", () => {
    const s = seriaZisku();
    for (let i = 1; i < s.length; i++) expect(s[i].marza).toBeGreaterThan(s[i - 1].marza);
  });
  it("debug print", () => {
    console.log("m2:", JSON.stringify(materialEurM2()));
    console.log("30m2:", JSON.stringify(spocitajZisk(30)));
    console.log("seria:", JSON.stringify(seriaZisku()));
  });
});
