/**
 * FÁZA 1 — Dátová vrstva e-shop kalkulátora.
 *
 * Jeden produkt = jedna SKU (konkrétne balenie). Hodnoty (balenie, ceny,
 * spotreby) sú prevzaté z katalógu (src/content/materialy*.json — CRM export
 * + HA-UZ cenníky), NIE vymyslené. `skuRef` odkazuje na katalógové SKU.
 *
 * priceRetail = konečná cena (neplatiteľ DPH — žiadny rozpad DPH).
 * priceTrade  = null vo Fáze 1; B2B ceny prídu vo Fáze 4 (server-side only).
 * priceRetail null = „cena na dopyt" (produkt bez potvrdenej ceny).
 *
 * hazardous: reaktívne živice (EP/PU komponenty) = true — štandardná GHS
 * klasifikácia 2K epoxidov/polyuretánov; piesky, chipsy, náradie = false.
 */

export type Brand = "Sika" | "TopStone" | "Arturo" | "UZIN" | "Iné";

export type ProductCategory =
  | "penetracia"
  | "nivelacia"
  | "hlavna-vrstva"
  | "vrchny-lak"
  | "posyp"
  | "naradie"
  | "spotrebny"
  | "oopp"
  | "doplnok";

export type PackUnit = "kg" | "l" | "ks" | "m" | "m2";

export interface Product {
  id: string;
  /** Katalógové SKU v src/content/materialy*.json (ak existuje). */
  skuRef?: string;
  sap?: string;
  ean?: string;
  brand: Brand;
  name: string;
  category: ProductCategory;
  packSize: number;
  packUnit: PackUnit;
  /** Konečná cena za balenie; null = na dopyt. */
  priceRetail: number | null;
  /** B2B cena — Fáza 4. NIKDY neposielať neprihlásenému užívateľovi. */
  priceTrade: number | null;
  colorOptions?: string[];
  colorSurcharge?: Record<string, number>;
  leadTimeDays?: number;
  hazardous: boolean;
  sdsUrl?: string;
  tdsUrl?: string;
  images: string[];
  description: string;
  /** Fáza 6 — do porovnávačov idú len produkty s true. Default false. */
  feedEnabled: boolean;
}

export const PRODUCTS: Product[] = [
  // ── MATERIÁLY PRE SKLADBY ────────────────────────────────────────────
  {
    id: "sika-151-30kg",
    skuRef: "SIKAFLOOR-151",
    brand: "Sika",
    name: "Sikafloor-151 Primer",
    category: "penetracia",
    packSize: 30,
    packUnit: "kg",
    priceRetail: 239.0,
    priceTrade: null,
    hazardous: true,
    images: [],
    description:
      "2K epoxidová penetrácia na betón a cementové potery. Základ pod epoxidové aj PU systémy.",
    feedEnabled: false,
  },
  {
    id: "sika-264-30kg",
    skuRef: "SIKAFLOOR-264-30",
    brand: "Sika",
    name: "Sikafloor-264 (2K epoxid)",
    category: "hlavna-vrstva",
    packSize: 30,
    packUnit: "kg",
    priceRetail: 295.0,
    priceTrade: null,
    colorOptions: ["RAL 7032", "RAL 7035", "RAL — pastel"],
    hazardous: true,
    images: [],
    description:
      "2K farebný epoxidový náter / stierka pre garáže, dielne a priemysel.",
    feedEnabled: false,
  },
  {
    id: "sika-3310-20kg",
    skuRef: "SF-3310",
    brand: "Sika",
    name: "Sikafloor-3310",
    category: "hlavna-vrstva",
    packSize: 20,
    packUnit: "kg",
    priceRetail: 217.55,
    priceTrade: null,
    hazardous: true,
    images: [],
    description: "PU medzivrstva pre klasický polyuretánový systém 2–3 mm.",
    feedEnabled: false,
  },
  {
    id: "sika-3000-20kg",
    skuRef: "SIKAFLOOR-3000-21",
    brand: "Sika",
    name: "Sikafloor-3000 (polyuretán)",
    category: "hlavna-vrstva",
    packSize: 20,
    packUnit: "kg",
    priceRetail: 346.41,
    priceTrade: null,
    hazardous: true,
    images: [],
    description:
      "2K liata polyuretánová podlaha — pružná, tichá, pre bývanie. Aplikuje sa len v 2 mm.",
    feedEnabled: false,
  },
  {
    id: "sika-01-primer-10kg",
    skuRef: "498421",
    brand: "Sika",
    name: "Sikafloor-01 Primer",
    category: "penetracia",
    packSize: 10,
    packUnit: "kg",
    priceRetail: 117.14,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Disperzná penetrácia pod nivelačné hmoty Sika Level.",
    feedEnabled: false,
  },
  {
    id: "sika-level-30-25kg",
    skuRef: "162680",
    brand: "Sika",
    name: "Sikafloor Level-30",
    category: "nivelacia",
    packSize: 25,
    packUnit: "kg",
    priceRetail: 40.16,
    priceTrade: null,
    hazardous: false,
    images: [],
    description:
      "Cementová nivelačná hmota. Minimálna hrúbka liatia 4 mm — pod ňou stráca pevnosť a praská.",
    feedEnabled: false,
  },
  {
    id: "sika-150-plus-25kg",
    skuRef: "SF-150-PLUS",
    brand: "Sika",
    name: "Sikafloor-150 Plus",
    category: "penetracia",
    packSize: 25,
    packUnit: "kg",
    priceRetail: 292.86,
    priceTrade: null,
    hazardous: true,
    images: [],
    description:
      "2K epoxidová penetrácia / medzivrstva. V skladbe Marble FX ide na prebrúsenú nivelačku (nie 03 Primer).",
    feedEnabled: false,
  },
  {
    id: "sika-3000fx-20kg",
    skuRef: "558772",
    brand: "Sika",
    name: "Sikafloor-3000 FX (metalická)",
    category: "hlavna-vrstva",
    packSize: 20,
    packUnit: "kg",
    priceRetail: 376.53,
    priceTrade: null,
    hazardous: true,
    images: [],
    description:
      "Dekoratívna PU stierka s FX efektom. Aplikuje sa v JEDNOM odtieni — dvojfarebné miešanie neponúkame.",
    feedEnabled: false,
  },
  {
    id: "sika-304w-matt-7-5kg",
    skuRef: "SIKAFLOOR-304W-7.5",
    brand: "Sika",
    name: "Sikafloor-304W Matt",
    category: "vrchny-lak",
    packSize: 7.5,
    packUnit: "kg",
    priceRetail: 246.0,
    priceTrade: null,
    hazardous: true,
    images: [],
    description:
      "Matný PU vrchný lak na vodnej báze. Riedi sa 10 % vodou, 0,13 kg/m² na vrstvu.",
    feedEnabled: false,
  },
  {
    id: "topstone-ep02-ral-25kg",
    skuRef: "TS-EP02-FARBENA-RAL",
    brand: "TopStone",
    name: "TopStone EP02 Farbená (RAL)",
    category: "penetracia",
    packSize: 25,
    packUnit: "kg",
    priceRetail: 242.23,
    priceTrade: null,
    colorOptions: ["RAL 7032", "RAL 7035", "RAL — pastel"],
    hazardous: true,
    images: [],
    description: "Farbená epoxidová podkladová vrstva pod metalický efekt.",
    feedEnabled: false,
  },
  {
    id: "topstone-ep11-metallic-20kg",
    skuRef: "TS-EP11-METALLIC",
    brand: "TopStone",
    name: "TopStone EP11 Metallic",
    category: "hlavna-vrstva",
    packSize: 20,
    packUnit: "kg",
    priceRetail: 550.91,
    priceTrade: null,
    hazardous: true,
    images: ["/images/eshop/topstone-metallic/sequoia.jpg"],
    description:
      "Metalická epoxidová stierka — 18 vzorov (Azuro, Gold, Sequoia…). Spotreba pre BA variant zatiaľ nepotvrdená.",
    feedEnabled: false,
  },
  {
    id: "topstone-ep22-plus-20kg",
    skuRef: "TS-EP22-PLUS",
    brand: "TopStone",
    name: "TopStone EP22 Plus",
    category: "vrchny-lak",
    packSize: 20,
    packUnit: "kg",
    priceRetail: 271.44,
    priceTrade: null,
    hazardous: true,
    images: ["/images/eshop/products/TS-EP22-PLUS.jpg"],
    description: "Číry liaty epoxidový uzáver do 2 mm nad metalický efekt.",
    feedEnabled: false,
  },
  {
    id: "chipsy-farebne-1kg",
    skuRef: "TS-FAREBNE-CHIPSY-3-MM-CH01-CH1",
    brand: "TopStone",
    name: "Farebné chipsy 3 mm (CH01–CH11)",
    category: "posyp",
    packSize: 1,
    packUnit: "kg",
    priceRetail: 22.1,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Dekoratívne farebné vločky na posyp do sýtosti.",
    feedEnabled: false,
  },
  {
    id: "piesok-04-08-25kg",
    skuRef: "AR-S1010",
    brand: "Arturo",
    name: "Kremičitý piesok 0,4–0,8 mm",
    category: "posyp",
    packSize: 25,
    packUnit: "kg",
    priceRetail: 15.9,
    priceTrade: null,
    hazardous: false,
    images: [],
    description:
      "Suchý kremičitý piesok na protišmykový presyp. (Najbližšia dostupná frakcia k 0,4–0,7 mm zo zadania.)",
    feedEnabled: false,
  },

  // ── NÁRADIE (reálne SKU z katalógu) ──────────────────────────────────
  {
    id: "valec-epoxid-25cm",
    skuRef: "AR-168936",
    brand: "Arturo",
    name: "Valec na epoxidy 25 cm",
    category: "spotrebny",
    packSize: 1,
    packUnit: "ks",
    priceRetail: 10.79,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Nylonový valec na aplikáciu epoxidov.",
    feedEnabled: false,
  },
  {
    id: "valec-lak-25cm",
    skuRef: "AR-168935",
    brand: "Arturo",
    name: "Valec na laky 25 cm (mikrovlákno)",
    category: "spotrebny",
    packSize: 1,
    packUnit: "ks",
    priceRetail: 14.83,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Valec s mikrovláknom na vrchné laky (náhrada mohérového).",
    feedEnabled: false,
  },
  {
    id: "gumova-stierka-25cm",
    skuRef: "AR-88402",
    brand: "Arturo",
    name: "Gumová stierka 25 cm",
    category: "naradie",
    packSize: 1,
    packUnit: "ks",
    priceRetail: 41.27,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Ručná gumová stierka na penetrácie a laky.",
    feedEnabled: false,
  },
  {
    id: "teleskopicka-tyc",
    skuRef: "AR-68824",
    brand: "Arturo",
    name: "Teleskopická tyč",
    category: "naradie",
    packSize: 1,
    packUnit: "ks",
    priceRetail: 97.09,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Teleskopická násada na stierku a valce.",
    feedEnabled: false,
  },
  {
    id: "kreppaska-3m-50m",
    skuRef: "AR-68820",
    brand: "Arturo",
    name: "Maskovacia páska 3M modrá (50 m)",
    category: "spotrebny",
    packSize: 1,
    packUnit: "ks",
    priceRetail: 11.56,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Maskovanie hrán a ukončení.",
    feedEnabled: false,
  },
  {
    id: "obuv-hroty",
    skuRef: "AR-83640",
    brand: "Arturo",
    name: "Obuv s hrotmi na lakovanie (pár)",
    category: "naradie",
    packSize: 1,
    packUnit: "ks",
    priceRetail: 123.92,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Hroty na topánky — pohyb po čerstvej stierke.",
    feedEnabled: false,
  },
  {
    id: "vedro-miesacie-30l",
    skuRef: "UZ-009191",
    brand: "UZIN",
    name: "Vedro miešacie 30 l",
    category: "naradie",
    packSize: 1,
    packUnit: "ks",
    priceRetail: 11.86,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Miešacia nádoba na živice a nivelačky.",
    feedEnabled: false,
  },
  {
    id: "vedro-odmerkove-10l",
    skuRef: "UZ-087607",
    brand: "UZIN",
    name: "Vedro odmerkové 10 l s vekom",
    category: "naradie",
    packSize: 1,
    packUnit: "ks",
    priceRetail: 5.34,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Odmerná nádoba na vodu a riedenie.",
    feedEnabled: false,
  },

  // ── NÁRADIE / OOPP BEZ POTVRDENEJ CENY — „cena na dopyt" ─────────────
  // Zámerne priceRetail: null — v katalógu ani cenníkoch nemáme potvrdenú
  // cenu. Neodhadujeme; doplní sa keď pribudne reálny cenník.
  {
    id: "jezkovy-valec",
    brand: "Iné",
    name: "Ježkový (odvzdušňovací) valec 25 cm",
    category: "naradie",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Odvzdušnenie liatych stierok a nivelačiek.",
    feedEnabled: false,
  },
  {
    id: "zubova-stierka",
    brand: "Iné",
    name: "Zubová stierka / rakla",
    category: "naradie",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Rozťahovanie stierky do rovnomernej hrúbky.",
    feedEnabled: false,
  },
  {
    id: "miesadlo",
    brand: "Iné",
    name: "Miešadlo do vŕtačky",
    category: "naradie",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Metla na dôkladné premiešanie 2K zložiek.",
    feedEnabled: false,
  },
  {
    id: "navleky-valec",
    brand: "Iné",
    name: "Náhradné návleky na valec (bal.)",
    category: "spotrebny",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Náhradné návleky — na každú vrstvu čerstvý.",
    feedEnabled: false,
  },
  {
    id: "zakryvacia-folia",
    brand: "Iné",
    name: "Zakrývacia fólia 4×5 m",
    category: "spotrebny",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Ochrana stien a zariadenia pred postrekom.",
    feedEnabled: false,
  },
  {
    id: "kombineza",
    brand: "Iné",
    name: "Ochranná kombinéza",
    category: "oopp",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Jednorazová kombinéza pri práci so živicami.",
    feedEnabled: false,
  },
  {
    id: "rukavice-nitril",
    brand: "Iné",
    name: "Nitrilové rukavice (bal. 100 ks)",
    category: "oopp",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Chemicky odolné jednorazové rukavice.",
    feedEnabled: false,
  },
  {
    id: "respirator-a2p3",
    brand: "Iné",
    name: "Respirátor A2P3 + filtre",
    category: "oopp",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description:
      "Polomaska s filtrami A2P3 proti organickým výparom — pri 2K živiciach povinná výbava.",
    feedEnabled: false,
  },
  {
    id: "respirator-filtre-nahradne",
    brand: "Iné",
    name: "Náhradné filtre A2P3 (pár)",
    category: "oopp",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Náhradné filtre k respirátoru.",
    feedEnabled: false,
  },
  {
    id: "okuliare",
    brand: "Iné",
    name: "Ochranné okuliare",
    category: "oopp",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Ochrana očí pred postrekom živice.",
    feedEnabled: false,
  },
  {
    id: "kolienkovky",
    brand: "Iné",
    name: "Kolienkovky (chrániče kolien)",
    category: "oopp",
    packSize: 1,
    packUnit: "ks",
    priceRetail: null,
    priceTrade: null,
    hazardous: false,
    images: [],
    description: "Chrániče kolien pri práci pri podlahe.",
    feedEnabled: false,
  },
];

import { getMaterial, type Material } from "@/lib/materialy";

/** Adaptér: materiál z katalógu (materialy.json) ako Product — vďaka nemu
 *  sa dá do košíka pridať CELÝ katalóg, nie len kurátorské PRODUCTS.
 *  Chémia je hazardous (ADR pri doprave), doplnky/náradie nie. */
export function materialAkoProduct(m: Material): Product {
  const kategoriaMap: Record<Material["kategoria"], ProductCategory> = {
    "Penetrácia": "penetracia",
    "Hlavná vrstva": "hlavna-vrstva",
    "Vrchný lak": "vrchny-lak",
    "Nivelačná hmota": "nivelacia",
    "Doplnok": "doplnok",
  };
  return {
    id: m.sku,
    skuRef: m.sku,
    brand: m.vyrobca,
    name: m.nazov,
    category: kategoriaMap[m.kategoria],
    packSize: m.balenie_kg ?? 1,
    packUnit: m.balenie_kg != null ? "kg" : "ks",
    priceRetail: m.cena_eur_s_dph > 0 ? m.cena_eur_s_dph : null,
    priceTrade: null,
    hazardous: m.kategoria !== "Doplnok",
    images: m.foto ? [m.foto] : [],
    description: "",
    feedEnabled: false,
  };
}

export function getProduct(id: string): Product | undefined {
  const p = PRODUCTS.find((x) => x.id === id);
  if (p) return p;
  const m = getMaterial(id);
  return m ? materialAkoProduct(m) : undefined;
}
