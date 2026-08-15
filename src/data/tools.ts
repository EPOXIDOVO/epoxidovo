/**
 * FÁZA 1 — Náradie a spotrebný materiál viazaný na skladby.
 *
 * Dva druhy položiek:
 *  - "naradie"   — vždy 1 ks, zákazník ho vie v košíku odškrtnúť
 *                  („mám už doma") → ownableAtHome: true
 *  - "spotrebny" — škáluje sa podľa plochy cez scaleM2PerUnit
 *                  (1 kus na každých začatých X m²; ceil)
 *
 * POZN.: hodnoty scaleM2PerUnit sú merchandisingové pravidlá balenia
 * (nie produktové dáta z cenníka) — dajú sa upraviť bez dopadu na ceny.
 */

export type ToolKind = "naradie" | "spotrebny" | "oopp";

export interface ToolItem {
  productId: string;
  kind: ToolKind;
  /** 1 kus na každých začatých X m². Ak chýba → vždy defaultQty. */
  scaleM2PerUnit?: number;
  /** Fixné množstvo (default 1). */
  defaultQty: number;
  /** Náradie, ktoré zákazník často má — v košíku odškrtnuteľné. */
  ownableAtHome: boolean;
}

/** Spoločný preset pre epoxidové / PU skladby bez nivelačky. */
export const TOOLS_PRESET_EPOXID: string[] = [
  "valec-epoxid-25cm",
  "valec-lak-25cm",
  "navleky-valec",
  "gumova-stierka-25cm",
  "zubova-stierka",
  "teleskopicka-tyc",
  "miesadlo",
  "vedro-miesacie-30l",
  "vedro-odmerkove-10l",
  "kreppaska-3m-50m",
  "zakryvacia-folia",
  "obuv-hroty",
  "kombineza",
  "rukavice-nitril",
  "respirator-a2p3",
  "respirator-filtre-nahradne",
  "okuliare",
  "kolienkovky",
];

/** Preset pre skladby s nivelačkou (Marble FX) — navyše ježkový valec. */
export const TOOLS_PRESET_NIVELACKA: string[] = [
  ...TOOLS_PRESET_EPOXID,
  "jezkovy-valec",
];

export const TOOL_ITEMS: ToolItem[] = [
  // spotrebný materiál — škáluje sa podľa plochy
  { productId: "valec-epoxid-25cm", kind: "spotrebny", scaleM2PerUnit: 40, defaultQty: 1, ownableAtHome: false },
  { productId: "valec-lak-25cm", kind: "spotrebny", scaleM2PerUnit: 40, defaultQty: 1, ownableAtHome: false },
  { productId: "navleky-valec", kind: "spotrebny", scaleM2PerUnit: 40, defaultQty: 1, ownableAtHome: false },
  { productId: "kreppaska-3m-50m", kind: "spotrebny", scaleM2PerUnit: 60, defaultQty: 1, ownableAtHome: false },
  { productId: "zakryvacia-folia", kind: "spotrebny", scaleM2PerUnit: 80, defaultQty: 1, ownableAtHome: false },

  // náradie — vždy 1 ks, odškrtnuteľné („mám už doma")
  { productId: "gumova-stierka-25cm", kind: "naradie", defaultQty: 1, ownableAtHome: true },
  { productId: "zubova-stierka", kind: "naradie", defaultQty: 1, ownableAtHome: true },
  { productId: "teleskopicka-tyc", kind: "naradie", defaultQty: 1, ownableAtHome: true },
  { productId: "miesadlo", kind: "naradie", defaultQty: 1, ownableAtHome: true },
  { productId: "vedro-miesacie-30l", kind: "naradie", defaultQty: 1, ownableAtHome: true },
  { productId: "vedro-odmerkove-10l", kind: "naradie", defaultQty: 1, ownableAtHome: true },
  { productId: "jezkovy-valec", kind: "naradie", defaultQty: 1, ownableAtHome: true },
  { productId: "obuv-hroty", kind: "naradie", defaultQty: 1, ownableAtHome: true },

  // OOPP — vždy 1 ks (rukavice/kombinéza sú balenia), odškrtnuteľné
  { productId: "kombineza", kind: "oopp", defaultQty: 1, ownableAtHome: true },
  { productId: "rukavice-nitril", kind: "oopp", defaultQty: 1, ownableAtHome: true },
  { productId: "respirator-a2p3", kind: "oopp", defaultQty: 1, ownableAtHome: true },
  { productId: "respirator-filtre-nahradne", kind: "oopp", defaultQty: 1, ownableAtHome: true },
  { productId: "okuliare", kind: "oopp", defaultQty: 1, ownableAtHome: true },
  { productId: "kolienkovky", kind: "oopp", defaultQty: 1, ownableAtHome: true },
];

export function getToolItem(productId: string): ToolItem | undefined {
  return TOOL_ITEMS.find((t) => t.productId === productId);
}
