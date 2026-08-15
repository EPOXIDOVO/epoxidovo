/**
 * FÁZA 2 — výpočtové jadro kalkulátora. Čisté funkcie, žiadne UI.
 *
 * Pravidlá (zo zadania, nemeniť):
 *  - balenia VŽDY Math.ceil — nikdy round/floor
 *  - potreba = plocha × (1 + rezerva) × spotreba × počet_vrstiev
 *    (pri "kg/m2/mm" navyše × hrúbka_mm)
 *  - Level-30 (a každá vrstva s minThicknessMm): hrúbka pod minimom je
 *    CHYBA, nie warning — výpočet ju odmietne
 *  - chýbajúca spotreba alebo cena → položka „na dopyt", súčet nie je finálny
 */

import type { Layer, System } from "@/data/systems";
import type { Product } from "@/data/products";
import { getProduct } from "@/data/products";
import { getToolItem } from "@/data/tools";

export interface LayerCalc {
  layer: Layer;
  product: Product;
  /** Celková potreba v jednotkách balenia (kg/l/ks); null = nepotvrdená spotreba. */
  need: number | null;
  packs: number | null;
  leftover: number | null;
  pricePerPack: number | null;
  totalPrice: number | null;
  /** true = položka sa nedá naceniť (chýba spotreba alebo cena). */
  onRequest: boolean;
}

export interface ToolCalc {
  product: Product;
  qty: number;
  pricePerUnit: number | null;
  totalPrice: number | null;
  ownableAtHome: boolean;
  onRequest: boolean;
}

export interface SystemCalc {
  system: System;
  areaM2: number;
  reservePct: number;
  thicknessMm: number | null;
  layers: LayerCalc[];
  tools: ToolCalc[];
  /** Súčet cien položiek, ktoré sa dali naceniť. */
  priceSubtotal: number;
  /** true = VŠETKY položky majú cenu → suma je finálna. */
  priceIsFinal: boolean;
  pricePerM2: number | null;
  warnings: string[];
}

export class ThicknessError extends Error {
  constructor(
    public readonly minMm: number,
    public readonly givenMm: number,
  ) {
    super(
      `Level-30 sa nesmie liať tenšie ako ${minMm} mm. Pri menšej hrúbke stráca pevnosť a praská.`,
    );
    this.name = "ThicknessError";
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Potreba materiálu pre jednu vrstvu.
 * @throws ThicknessError ak je hrúbka pod tvrdým minimom vrstvy
 */
export function calcLayer(
  layer: Layer,
  areaM2: number,
  reservePct: number,
  thicknessMm?: number,
): LayerCalc {
  const product = getProduct(layer.productId);
  if (!product) {
    throw new Error(`Neznámy produkt v skladbe: ${layer.productId}`);
  }

  const perMm = layer.consumptionUnit === "kg/m2/mm";
  let usedThickness = layer.thicknessMm ?? null;
  if (perMm) {
    usedThickness = thicknessMm ?? layer.thicknessMm ?? null;
    if (layer.minThicknessMm != null) {
      if (usedThickness == null || usedThickness < layer.minThicknessMm) {
        throw new ThicknessError(layer.minThicknessMm, usedThickness ?? 0);
      }
    }
  }

  if (layer.consumption == null) {
    return {
      layer,
      product,
      need: null,
      packs: null,
      leftover: null,
      pricePerPack: product.priceRetail,
      totalPrice: null,
      onRequest: true,
    };
  }

  const coats = layer.coats ?? 1;
  let need =
    areaM2 * (1 + reservePct / 100) * layer.consumption * coats;
  if (perMm) need *= usedThickness as number;
  need = round2(need);

  const packs = Math.ceil(need / product.packSize);
  const leftover = round2(packs * product.packSize - need);

  const pricePerPack = product.priceRetail;
  const totalPrice = pricePerPack != null ? round2(packs * pricePerPack) : null;

  return {
    layer,
    product,
    need,
    packs,
    leftover,
    pricePerPack,
    totalPrice,
    onRequest: pricePerPack == null,
  };
}

/** Množstvo spotrebného materiálu / náradia pre danú plochu. */
export function calcTool(productId: string, areaM2: number): ToolCalc | null {
  const product = getProduct(productId);
  const item = getToolItem(productId);
  if (!product || !item) return null;

  const qty = item.scaleM2PerUnit
    ? Math.max(item.defaultQty, Math.ceil(areaM2 / item.scaleM2PerUnit))
    : item.defaultQty;

  const pricePerUnit = product.priceRetail;
  return {
    product,
    qty,
    pricePerUnit,
    totalPrice: pricePerUnit != null ? round2(qty * pricePerUnit) : null,
    ownableAtHome: item.ownableAtHome,
    onRequest: pricePerUnit == null,
  };
}

export interface CalcOptions {
  areaM2: number;
  /** Rezerva v % (0–15, default 5). */
  reservePct?: number;
  /** Hrúbka nivelačky v mm (ak skladba obsahuje per-mm vrstvu). */
  thicknessMm?: number;
  /** Pridať náradie a ochranné pomôcky (default true). */
  includeTools?: boolean;
  /** productId náradia, ktoré zákazník odškrtol („mám už doma"). */
  excludedTools?: string[];
}

/**
 * Kompletný výpočet skladby.
 * @throws ThicknessError pri hrúbke nivelačky pod minimom
 */
export function calcSystem(system: System, opts: CalcOptions): SystemCalc {
  const reservePct = opts.reservePct ?? 5;
  const warnings: string[] = [];

  const layers = system.layers
    .filter((l) => !l.optional || l.consumption != null)
    .map((l) => calcLayer(l, opts.areaM2, reservePct, opts.thicknessMm));

  const includeTools = opts.includeTools ?? true;
  const excluded = new Set(opts.excludedTools ?? []);
  const tools: ToolCalc[] = includeTools
    ? system.toolsPreset
        .filter((id) => !excluded.has(id))
        .map((id) => calcTool(id, opts.areaM2))
        .filter((t): t is ToolCalc => t != null)
    : [];

  const priced = [...layers, ...tools].filter((x) => x.totalPrice != null);
  const unpriced = [...layers, ...tools].filter((x) => x.totalPrice == null);
  const priceSubtotal = round2(
    priced.reduce((sum, x) => sum + (x.totalPrice as number), 0),
  );
  const priceIsFinal = unpriced.length === 0 && system.complete;

  if (opts.areaM2 > 200) {
    warnings.push(
      "Pri ploche nad 200 m² odporúčame individuálnu cenovú ponuku — vieme ponúknuť lepšie podmienky.",
    );
  }
  if (!system.complete) {
    warnings.push(
      "Táto skladba obsahuje položky bez potvrdenej spotreby alebo ceny — celkovú cenu doladíme e-mailom.",
    );
  }

  return {
    system,
    areaM2: opts.areaM2,
    reservePct,
    thicknessMm: opts.thicknessMm ?? null,
    layers,
    tools,
    priceSubtotal,
    priceIsFinal,
    pricePerM2:
      priceIsFinal && opts.areaM2 > 0
        ? round2(priceSubtotal / opts.areaM2)
        : null,
    warnings,
  };
}

/** Súčet plôch miestností (pomôcka „nemám zmerané"). */
export function sumRooms(rooms: { lengthM: number; widthM: number }[]): number {
  return round2(
    rooms.reduce((sum, r) => {
      const a = r.lengthM > 0 && r.widthM > 0 ? r.lengthM * r.widthM : 0;
      return sum + a;
    }, 0),
  );
}

/** Hmotnosť objednávky v kg — pre výpočet dopravy. */
export function calcWeightKg(
  items: { packSizeKg: number | null; qty: number }[],
): number {
  return round2(
    items.reduce((sum, i) => sum + (i.packSizeKg ?? 0) * i.qty, 0),
  );
}
