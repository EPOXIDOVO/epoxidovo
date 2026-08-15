/**
 * FÁZA 1 — Skladby podláh (systems). Srdce kalkulátora.
 *
 * Dáta skladieb sú OVERENÉ zo zadania — nemeniť bez pokynu:
 *  - do skladby „PU s nivelačnou vrstvou / Marble FX" NEPATRÍ Sikafloor-3310
 *  - 3000FX sa aplikuje v JEDNOM odtieni (žiadne dvojfarebné miešanie)
 *  - Level-30 má tvrdé minimum 4 mm
 *  - EP11 Metalic BA: spotreba nepotvrdená → consumption: null,
 *    systém complete: false (katalóg uvádza 1,5 kg/m², ale zadanie hovorí
 *    „nepotvrdené" — do potvrdenia sa v kalkulátore zobrazí „na dopyt")
 */

export type UseCase =
  | "garaz"
  | "byt"
  | "dielna"
  | "terasa"
  | "schody"
  | "telocvicna";

export type ConsumptionUnit = "kg/m2" | "kg/m2/mm" | "l/m2" | "ks/m2";

export interface Layer {
  step: number;
  label: string;
  productId: string;
  /** Spotreba na m²; null = nepotvrdená (produkt „na dopyt", systém
   *  complete: false). Nikdy neodhadujeme. */
  consumption: number | null;
  consumptionUnit: ConsumptionUnit;
  thicknessMm?: number;
  /** Tvrdé minimum — kalkulátor NESMIE pustiť nižšiu hodnotu. */
  minThicknessMm?: number;
  coats?: number;
  optional?: boolean;
  /** Vrstva sa použije len ak platí podmienka (napr. nerovný podklad). */
  conditionKey?: string;
  note?: string;
}

export interface System {
  id: string;
  name: string;
  tier: "Standard" | "Premium";
  useCases: UseCase[];
  interior: boolean;
  exterior: boolean;
  totalThicknessMm: number;
  layers: Layer[];
  /** productId náradia a spotrebného materiálu (viď tools.ts presety). */
  toolsPreset: string[];
  /** false = chýbajú dáta (napr. spotreba) — UI to musí priznať. */
  complete: boolean;
  description: string;
}

import { TOOLS_PRESET_EPOXID, TOOLS_PRESET_NIVELACKA } from "./tools";

export const SYSTEMS: System[] = [
  // ── 1. Garáž jednofarebná epoxid (Standard) ─────────────────────────
  {
    id: "garaz-jednofarebna-epoxid",
    name: "Garážová jednofarebná epoxidová podlaha",
    tier: "Standard",
    useCases: ["garaz", "dielna"],
    interior: true,
    exterior: false,
    totalThicknessMm: 1,
    layers: [
      {
        step: 1,
        label: "Penetrácia",
        productId: "sika-151-30kg",
        consumption: 0.4,
        consumptionUnit: "kg/m2",
      },
      {
        step: 2,
        label: "Hlavná vrstva",
        productId: "sika-264-30kg",
        consumption: 1.5,
        consumptionUnit: "kg/m2",
        coats: 2,
        note: "Aplikuje sa v dvoch vrstvách.",
      },
      {
        step: 3,
        label: "Protišmykový presyp",
        productId: "piesok-04-08-25kg",
        consumption: 1,
        consumptionUnit: "kg/m2",
        note: "Presyp do sýtosti — cca 1 kg/m².",
      },
    ],
    toolsPreset: TOOLS_PRESET_EPOXID,
    complete: true,
    description:
      "Odolná jednofarebná epoxidová podlaha do garáže a dielne s protišmykovým presypom.",
  },

  // ── 2. Epoxidová chipsová podlaha (Standard) ────────────────────────
  {
    id: "chipsova-epoxid",
    name: "Epoxidová chipsová podlaha",
    tier: "Standard",
    useCases: ["garaz", "dielna"],
    interior: true,
    exterior: false,
    totalThicknessMm: 1,
    layers: [
      {
        step: 1,
        label: "Penetrácia",
        productId: "sika-151-30kg",
        consumption: 0.4,
        consumptionUnit: "kg/m2",
      },
      {
        step: 2,
        label: "Hlavná vrstva",
        productId: "sika-264-30kg",
        consumption: 1.5,
        consumptionUnit: "kg/m2",
      },
      {
        step: 3,
        label: "Chipsový posyp",
        productId: "chipsy-farebne-1kg",
        consumption: null,
        consumptionUnit: "kg/m2",
        note: "Posyp do sýtosti — množstvo závisí od želanej hustoty vzoru.",
      },
      {
        step: 4,
        label: "Kremičitý piesok",
        productId: "piesok-04-08-25kg",
        consumption: null,
        consumptionUnit: "kg/m2",
        note: "Posyp do sýtosti.",
      },
    ],
    toolsPreset: TOOLS_PRESET_EPOXID,
    // posyp „do sýtosti" nemá potvrdenú číselnú spotrebu → systém sa dá
    // kalkulovať len čiastočne; UI musí ukázať „cenu doladíme e-mailom"
    complete: false,
    description:
      "Praktická chipsová podlaha — vločky skryjú nečistoty, povrch je protišmykový.",
  },

  // ── 3. Klasický PU 2–3 mm (Premium) ─────────────────────────────────
  {
    id: "pu-klasik",
    name: "Klasická polyuretánová podlaha 2–3 mm",
    tier: "Premium",
    useCases: ["byt", "telocvicna"],
    interior: true,
    exterior: false,
    totalThicknessMm: 2,
    layers: [
      {
        step: 1,
        label: "Penetrácia",
        productId: "sika-151-30kg",
        consumption: 0.4,
        consumptionUnit: "kg/m2",
      },
      {
        step: 2,
        label: "Medzivrstva",
        productId: "sika-3310-20kg",
        consumption: 1.2,
        consumptionUnit: "kg/m2",
      },
      {
        step: 3,
        label: "Hlavná vrstva",
        productId: "sika-3000-20kg",
        consumption: 1.5,
        consumptionUnit: "kg/m2",
        note: "Polyuretán sa aplikuje len v 2 mm hrúbke.",
      },
      {
        step: 4,
        label: "Kremičitý piesok",
        productId: "piesok-04-08-25kg",
        consumption: null,
        consumptionUnit: "kg/m2",
        optional: true,
        note: "Podľa potreby (plnenie / protišmyk).",
      },
    ],
    toolsPreset: TOOLS_PRESET_EPOXID,
    complete: true,
    description:
      "Pružná a tichá polyuretánová podlaha pre bývanie a športové povrchy.",
  },

  // ── 4. PU s nivelačnou vrstvou / Marble FX (Premium) — hlavný pre byty
  {
    id: "marble-fx",
    name: "Dizajnová podlaha Marble FX s nivelačnou vrstvou",
    tier: "Premium",
    useCases: ["byt"],
    interior: true,
    exterior: false,
    totalThicknessMm: 6,
    layers: [
      {
        step: 1,
        label: "Penetrácia pod nivelačku",
        productId: "sika-01-primer-10kg",
        consumption: 0.1,
        consumptionUnit: "kg/m2",
      },
      {
        step: 2,
        label: "Nivelačná vrstva",
        productId: "sika-level-30-25kg",
        consumption: 1.8,
        consumptionUnit: "kg/m2/mm",
        thicknessMm: 4,
        minThicknessMm: 4,
        note: "Level-30 sa nesmie liať tenšie ako 4 mm. Pri menšej hrúbke stráca pevnosť a praská. Pri 4 mm = 7,2 kg/m².",
      },
      {
        step: 3,
        label: "Medzivrstva",
        productId: "sika-150-plus-25kg",
        consumption: 0.4,
        consumptionUnit: "kg/m2",
        note: "Pred aplikáciou nivelačku prebrúsiť a povysávať. Medzivrstva je Sikafloor-150 Plus — NIE 03 Primer.",
      },
      {
        step: 4,
        label: "Dizajnová stierka",
        productId: "sika-3000fx-20kg",
        consumption: 2.8,
        consumptionUnit: "kg/m2",
        thicknessMm: 2,
        note: "2,8 kg/m² pri 2 mm. Aplikuje sa v jednom odtieni — dvojfarebné miešanie neponúkame.",
      },
      {
        step: 5,
        label: "Vrchný lak",
        productId: "sika-304w-matt-7-5kg",
        consumption: 0.13,
        consumptionUnit: "kg/m2",
        coats: 1,
        note: "Riedený 10 % vodou, 0,13 kg/m² na vrstvu.",
      },
    ],
    toolsPreset: TOOLS_PRESET_NIVELACKA,
    complete: true,
    description:
      "Hlavný systém pre byty — nivelačná vrstva vyrovná podklad, dizajnová stierka 3000FX vytvorí mramorový efekt.",
  },

  // ── 5. Metalický efekt TopStone (Premium) ───────────────────────────
  {
    id: "metalik-topstone",
    name: "Metalický efekt TopStone",
    tier: "Premium",
    useCases: ["byt", "garaz"],
    interior: true,
    exterior: false,
    totalThicknessMm: 3,
    layers: [
      {
        step: 1,
        label: "Podkladová vrstva",
        productId: "topstone-ep02-ral-25kg",
        consumption: 0.5,
        consumptionUnit: "kg/m2",
        note: "Farbená RAL — podklad ladí s odtieňom metalického efektu.",
      },
      {
        step: 2,
        label: "Metalická stierka",
        productId: "topstone-ep11-metallic-20kg",
        // Zadanie: spotreba EP11 Metalic BA NIE JE potvrdená. Neodhadujeme.
        consumption: null,
        consumptionUnit: "kg/m2",
        note: "Spotreba pre BA variant zatiaľ nepotvrdená — cenu doladíme e-mailom.",
      },
      {
        step: 3,
        label: "Číry uzáver",
        productId: "topstone-ep22-plus-20kg",
        consumption: 1.5,
        consumptionUnit: "kg/m2",
        note: "Číry liaty vrchný uzáver do 2 mm.",
      },
    ],
    toolsPreset: TOOLS_PRESET_EPOXID,
    complete: false,
    description:
      "Efektná metalická podlaha TopStone — 18 vzorov, každá realizácia je originál.",
  },
];

export function getSystem(id: string): System | undefined {
  return SYSTEMS.find((s) => s.id === id);
}
