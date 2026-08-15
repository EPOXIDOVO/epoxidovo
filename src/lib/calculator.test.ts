import { describe, it, expect } from "vitest";
import {
  calcLayer,
  calcSystem,
  calcTool,
  sumRooms,
  calcWeightKg,
  ThicknessError,
} from "./calculator";
import { getSystem } from "@/data/systems";
import type { Layer } from "@/data/systems";

const garaz = getSystem("garaz-jednofarebna-epoxid")!;
const marble = getSystem("marble-fx")!;
const metalik = getSystem("metalik-topstone")!;
const chipsova = getSystem("chipsova-epoxid")!;

describe("calcLayer — zaokrúhľovanie NAHOR na celé balenia", () => {
  it("ceil, nikdy round: 20 m² × 0,4 kg/m² = 8 kg → 1 balenie po 30 kg", () => {
    const penetracia = garaz.layers[0];
    const r = calcLayer(penetracia, 20, 0);
    expect(r.need).toBe(8);
    expect(r.packs).toBe(1);
    expect(r.leftover).toBe(22);
  });

  it("30,1 kg potreby pri 30 kg balení = 2 balenia (nie 1)", () => {
    // 264: 1,5 kg/m² × 2 vrstvy: plocha 10,04 m², rezerva 0 → 30,12 kg
    const hlavna = garaz.layers[1];
    const r = calcLayer(hlavna, 10.04, 0);
    expect(r.need).toBeCloseTo(30.12, 2);
    expect(r.packs).toBe(2);
  });

  it("presne plné balenie NEpridáva ďalšie: 10 m² → 30 kg = 1 balenie", () => {
    const hlavna = garaz.layers[1]; // 1,5 × 2 vrstvy = 3 kg/m²
    const r = calcLayer(hlavna, 10, 0);
    expect(r.need).toBe(30);
    expect(r.packs).toBe(1);
    expect(r.leftover).toBe(0);
  });
});

describe("calcLayer — rezerva", () => {
  it("5 % rezerva zvyšuje potrebu: 20 m² × 0,4 × 1,05 = 8,4 kg", () => {
    const penetracia = garaz.layers[0];
    const r = calcLayer(penetracia, 20, 5);
    expect(r.need).toBeCloseTo(8.4, 2);
  });

  it("15 % rezerva: 100 m² × 3 kg/m² × 1,15 = 345 kg → 12 balení po 30 kg", () => {
    const hlavna = garaz.layers[1];
    const r = calcLayer(hlavna, 100, 15);
    expect(r.need).toBeCloseTo(345, 2);
    expect(r.packs).toBe(12);
  });
});

describe("calcLayer — viacvrstvové nátery (coats)", () => {
  it("264 s coats: 2 → dvojnásobná spotreba", () => {
    const hlavna = garaz.layers[1];
    const r = calcLayer(hlavna, 10, 0);
    // 10 × 1,5 × 2 = 30 kg
    expect(r.need).toBe(30);
  });
});

describe("calcLayer — minimálna hrúbka nivelačky (tvrdé pravidlo)", () => {
  const nivelacka = marble.layers.find((l) => l.minThicknessMm != null)!;

  it("hrúbka 3 mm pod minimom 4 mm → ThicknessError", () => {
    expect(() => calcLayer(nivelacka, 20, 5, 3)).toThrow(ThicknessError);
  });

  it("hrúbka presne 4 mm prejde: 1,8 kg/m²/mm × 4 = 7,2 kg/m²", () => {
    const r = calcLayer(nivelacka, 10, 0, 4);
    expect(r.need).toBeCloseTo(72, 2); // 10 m² × 7,2
    expect(r.packs).toBe(3); // 72 / 25 = 2,88 → 3
  });

  it("bez zadanej hrúbky použije default 4 mm zo skladby", () => {
    const r = calcLayer(nivelacka, 10, 0);
    expect(r.need).toBeCloseTo(72, 2);
  });
});

describe("calcLayer — nepotvrdená spotreba = na dopyt, žiadny odhad", () => {
  it("EP11 Metallic (consumption null) → need null, onRequest true", () => {
    const ep11 = metalik.layers[1];
    const r = calcLayer(ep11, 50, 5);
    expect(r.need).toBeNull();
    expect(r.packs).toBeNull();
    expect(r.onRequest).toBe(true);
  });
});

describe("calcSystem", () => {
  it("garáž 20 m² @5 % — kompletná skladba má finálnu cenu", () => {
    const r = calcSystem(garaz, { areaM2: 20, includeTools: false });
    expect(r.priceIsFinal).toBe(true);
    expect(r.priceSubtotal).toBeGreaterThan(0);
    expect(r.pricePerM2).not.toBeNull();
  });

  it("metalik — complete:false → cena NIE JE finálna", () => {
    const r = calcSystem(metalik, { areaM2: 30, includeTools: false });
    expect(r.priceIsFinal).toBe(false);
    expect(r.warnings.join(" ")).toMatch(/doladíme e-mailom/);
  });

  it("chipsová — posyp bez čísla → nie finálna", () => {
    const r = calcSystem(chipsova, { areaM2: 25, includeTools: false });
    expect(r.priceIsFinal).toBe(false);
  });

  it("plocha nad 200 m² pridá odporúčanie individuálnej ponuky", () => {
    const r = calcSystem(garaz, { areaM2: 250, includeTools: false });
    expect(r.warnings.join(" ")).toMatch(/200 m²/);
  });

  it("marble FX 50 m² @4 mm @5 % počíta všetkých 5 vrstiev", () => {
    const r = calcSystem(marble, {
      areaM2: 50,
      thicknessMm: 4,
      includeTools: false,
    });
    expect(r.layers).toHaveLength(5);
    expect(r.priceIsFinal).toBe(true);
    // sanity: nivelačka 50×1,05×7,2 = 378 kg → 16 balení po 25 kg
    const niv = r.layers.find((l) => l.product.id === "sika-level-30-25kg")!;
    expect(niv.packs).toBe(16);
  });

  it("excludedTools vyhodí náradie („mám už doma“)", () => {
    const all = calcSystem(garaz, { areaM2: 20 });
    const without = calcSystem(garaz, {
      areaM2: 20,
      excludedTools: ["teleskopicka-tyc"],
    });
    expect(without.tools.length).toBe(all.tools.length - 1);
  });
});

describe("calcTool — škálovanie spotrebného materiálu", () => {
  it("valec 1 ks / 40 m²: 20 m² → 1 ks, 90 m² → 3 ks", () => {
    expect(calcTool("valec-epoxid-25cm", 20)!.qty).toBe(1);
    expect(calcTool("valec-epoxid-25cm", 90)!.qty).toBe(3);
  });

  it("náradie bez škálovania je vždy 1 ks", () => {
    expect(calcTool("teleskopicka-tyc", 500)!.qty).toBe(1);
  });

  it("náradie bez ceny je onRequest, nie 0 €", () => {
    const r = calcTool("respirator-a2p3", 20)!;
    expect(r.onRequest).toBe(true);
    expect(r.totalPrice).toBeNull();
  });
});

describe("pomôcky", () => {
  it("sumRooms sčíta miestnosti", () => {
    expect(
      sumRooms([
        { lengthM: 5, widthM: 4 },
        { lengthM: 3, widthM: 2.5 },
      ]),
    ).toBeCloseTo(27.5, 2);
  });

  it("calcWeightKg počíta hmotnosť dopravy", () => {
    expect(
      calcWeightKg([
        { packSizeKg: 30, qty: 2 },
        { packSizeKg: null, qty: 5 }, // náradie bez hmotnosti
      ]),
    ).toBe(60);
  });
});
