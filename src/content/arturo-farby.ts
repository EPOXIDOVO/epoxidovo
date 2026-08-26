/**
 * Odtiene Arturo — stiahnuté z arturocollection.com/colour-chart.
 *
 * Arturo je výrobca, nie druh podlahy, takže vo vzorkovníku nemá vlastnú
 * záložku. Jednotlivé rady patria pod naše typy podláh — mapa nižšie
 * (ARTURO_RAD_NA_TYP) hovorí, ktorý kam.
 */

export type ArturoFarba = {
  /** Mikrocement sme z ponuky vyradili (user 2026-08-25: „nerobíme a robiť
   *  nebudeme"), preto tu nie je. */
  typ: "Unicolor" | "Concrete look" | "Mistral" | "Concreta";
  nazov: string;
  /** Kód z Arturo katalógu (data-sku na ich webe), ak ho uvádzajú. */
  sku: string | null;
  obrazok: string;
};

export const ARTURO_TYPY = ["Unicolor", "Concrete look", "Mistral", "Concreta"] as const;

/**
 * Arturo je VÝROBCA, nie typ podlahy — jeho rady patria pod naše typy,
 * nie vedľa nich (user 2026-08-25). Táto mapa hovorí, kam ktorý rad ide.
 */
export const ARTURO_RAD_NA_TYP: Record<string, "jednofarebne" | "beton-look" | "mistral"> = {
  Unicolor: "jednofarebne",
  "Concrete look": "beton-look",
  Concreta: "beton-look",
  Mistral: "mistral",
};

/** Odtiene Arturo pre daný typ podlahy. */
export function arturoPreTyp(typ: string): ArturoFarba[] {
  return ARTURO_FARBY.filter((f) => ARTURO_RAD_NA_TYP[f.typ] === typ);
}

export const ARTURO_FARBY: ArturoFarba[] = [
  { typ: "Unicolor", nazov: "Basic White", sku: "BSCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-basic-white.webp" },
  { typ: "Unicolor", nazov: "Calm Grey", sku: "CGCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-calm-grey.webp" },
  { typ: "Unicolor", nazov: "Coral White", sku: "CWCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-coral-white.webp" },
  { typ: "Unicolor", nazov: "Cute Blue", sku: "CBLC1", obrazok: "/images/vzorkovnik/arturo/unicolor-cute-blue.webp" },
  { typ: "Unicolor", nazov: "Dark Fuchsia", sku: "DFCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-dark-fuchsia.webp" },
  { typ: "Unicolor", nazov: "Dusty Grey", sku: "DGRCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-dusty-grey.webp" },
  { typ: "Unicolor", nazov: "Easy Grey", sku: "EGCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-easy-grey.webp" },
  { typ: "Unicolor", nazov: "Elegant Grey", sku: "EGRCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-elegant-grey.webp" },
  { typ: "Unicolor", nazov: "Faded Rose", sku: "FRCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-faded-rose.webp" },
  { typ: "Unicolor", nazov: "Grizzled Blue", sku: "GBCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-grizzled-blue.webp" },
  { typ: "Unicolor", nazov: "Icicle White", sku: "IWCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-icicle-white.webp" },
  { typ: "Unicolor", nazov: "Inky Blue", sku: "IBCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-inky-blue.webp" },
  { typ: "Unicolor", nazov: "Iron Grey", sku: "IGRCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-iron-grey.webp" },
  { typ: "Unicolor", nazov: "Misty Grey", sku: "MGCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-misty-grey.webp" },
  { typ: "Unicolor", nazov: "Modest Green", sku: "MGRCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-modest-green.webp" },
  { typ: "Unicolor", nazov: "Pale Green", sku: "PGCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-pale-green.webp" },
  { typ: "Unicolor", nazov: "Rib Beige", sku: "RBCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-rib-beige.webp" },
  { typ: "Unicolor", nazov: "Signal Red", sku: "SRRCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-signal-red.webp" },
  { typ: "Unicolor", nazov: "Solid Grey", sku: "SGCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-solid-grey.webp" },
  { typ: "Unicolor", nazov: "Steely Grey", sku: "SGRCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-steely-grey.webp" },
  { typ: "Unicolor", nazov: "Stylish Grey", sku: "SGRECC1", obrazok: "/images/vzorkovnik/arturo/unicolor-stylish-grey.webp" },
  { typ: "Unicolor", nazov: "Terracotta Red", sku: "TRCC1", obrazok: "/images/vzorkovnik/arturo/unicolor-terracotta-red.webp" },
  { typ: "Concrete look", nazov: "Basic Wash", sku: "BWCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-basic-wash.webp" },
  { typ: "Concrete look", nazov: "Cosmic Fusion", sku: "CFCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-cosmic-fusion.webp" },
  { typ: "Concrete look", nazov: "Dark Move", sku: "DMCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-dark-move.webp" },
  { typ: "Concrete look", nazov: "Downtown Mix", sku: "DTMCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-downtown-mix.webp" },
  { typ: "Concrete look", nazov: "Foggy Sky", sku: "FSCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-foggy-sky.webp" },
  { typ: "Concrete look", nazov: "Fresh Power", sku: "FPCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-fresh-power.webp" },
  { typ: "Concrete look", nazov: "Frozen Cosmos", sku: "FZCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-frozen-cosmos.webp" },
  { typ: "Concrete look", nazov: "Harsh Gravel", sku: "HGCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-harsh-gravel.webp" },
  { typ: "Concrete look", nazov: "Ice Cave", sku: "ICCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-ice-cave.webp" },
  { typ: "Concrete look", nazov: "Looming Dust", sku: "LDCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-looming-dust.webp" },
  { typ: "Concrete look", nazov: "Mixed Clay", sku: "MCCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-mixed-clay.webp" },
  { typ: "Concrete look", nazov: "Morning Flow", sku: "MFLCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-morning-flow.webp" },
  { typ: "Concrete look", nazov: "Native Shadow", sku: "NSCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-native-shadow.webp" },
  { typ: "Concrete look", nazov: "Nordic Night", sku: "NNCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-nordic-night.webp" },
  { typ: "Concrete look", nazov: "Outback Dream", sku: "ODCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-outback-dream.webp" },
  { typ: "Concrete look", nazov: "Raw Basalt", sku: "RWCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-raw-basalt.webp" },
  { typ: "Concrete look", nazov: "Rough Lead", sku: "RLCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-rough-lead.webp" },
  { typ: "Concrete look", nazov: "Soft Stone", sku: "SSTCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-soft-stone.webp" },
  { typ: "Concrete look", nazov: "Velvet Blossom", sku: "VBCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-velvet-blossom.webp" },
  { typ: "Concrete look", nazov: "Volcano Flame", sku: "VFCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-volcano-flame.webp" },
  { typ: "Concrete look", nazov: "Worn Stuff", sku: "WSCC1", obrazok: "/images/vzorkovnik/arturo/concrete-look-worn-stuff.webp" },
  { typ: "Mistral", nazov: "Basic Wash", sku: "MBW1", obrazok: "/images/vzorkovnik/arturo/mistral-basic-wash.webp" },
  { typ: "Mistral", nazov: "Calm Breeze", sku: "MCB1", obrazok: "/images/vzorkovnik/arturo/mistral-calm-breeze.webp" },
  { typ: "Mistral", nazov: "Endless Beach", sku: null, obrazok: "/images/vzorkovnik/arturo/mistral-endless-beach.webp" },
  { typ: "Mistral", nazov: "Foggy Sky", sku: "MFS1", obrazok: "/images/vzorkovnik/arturo/mistral-foggy-sky.webp" },
  { typ: "Mistral", nazov: "Frozen Cosmos", sku: "MFC1", obrazok: "/images/vzorkovnik/arturo/mistral-frozen-cosmos.webp" },
  { typ: "Mistral", nazov: "Gentle Shade", sku: null, obrazok: "/images/vzorkovnik/arturo/mistral-gentle-shade.webp" },
  { typ: "Mistral", nazov: "Harsh Gravel", sku: "MHG1", obrazok: "/images/vzorkovnik/arturo/mistral-harsh-gravel.webp" },
  { typ: "Mistral", nazov: "Ice Cave", sku: "MIC1", obrazok: "/images/vzorkovnik/arturo/mistral-ice-cave.webp" },
  { typ: "Mistral", nazov: "Mixed Clay", sku: "MMC1", obrazok: "/images/vzorkovnik/arturo/mistral-mixed-clay.webp" },
  { typ: "Concreta", nazov: "Dove", sku: "CD1", obrazok: "/images/vzorkovnik/arturo/concreta-dove.webp" },
  { typ: "Concreta", nazov: "Fossil", sku: "CF1", obrazok: "/images/vzorkovnik/arturo/concreta-fossil.webp" },
  { typ: "Concreta", nazov: "Pebble", sku: "CP1", obrazok: "/images/vzorkovnik/arturo/concreta-pebble.webp" },
  { typ: "Concreta", nazov: "Rust", sku: "CR1", obrazok: "/images/vzorkovnik/arturo/concreta-rust.webp" },
  { typ: "Concreta", nazov: "Sand", sku: "CS1", obrazok: "/images/vzorkovnik/arturo/concreta-sand.webp" },
  { typ: "Concreta", nazov: "Shadow", sku: "CSH1", obrazok: "/images/vzorkovnik/arturo/concreta-shadow.webp" },
  { typ: "Concreta", nazov: "Silver", sku: "CI1", obrazok: "/images/vzorkovnik/arturo/concreta-silver.webp" },
  { typ: "Concreta", nazov: "Smoke", sku: "CSM1", obrazok: "/images/vzorkovnik/arturo/concreta-smoke.webp" },
];
