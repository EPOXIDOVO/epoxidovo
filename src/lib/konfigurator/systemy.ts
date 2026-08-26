/**
 * Dátový model systémov pre konfigurátor „Navrhni si podlahu".
 *
 * Systémy sú definované DÁTOVO — pridanie nového systému znamená pridať
 * objekt do poľa SYSTEMY, nie zasahovať do UI. Podmienky (`podmienky`)
 * hovoria, kedy sa systém smie ponúknuť; tvrdé technické zákazy sú
 * v `rules.ts`.
 *
 * NÁZVOSLOVIE: zákazník nikdy nevyberá „epoxid vs polyuretán" — vidí
 * Standard / Premium a rozdiel vo vlastnostiach. Technický názov produktu
 * sa objaví až v detaile skladby.
 *
 * Spotreby sú overené (viď tabuľka v prompte) — NEMENIŤ bez konzultácie.
 * Stenové systémy majú spotreby zatiaľ null (TODO: doplní Tristan).
 */

export type Co = "podlaha" | "stena" | "schody";
export type Kde = "interier" | "exterier";

export type Vrstva = {
  poradie: number;
  /** Rola vrstvy v skladbe — „Penetrácia", „Hlavná vrstva"… */
  nazov: string;
  produktSku: string;
  produktNazov: string;
  /** kg/m²; null = spotrebu zatiaľ nepoznáme → v UI „na dopyt" */
  spotrebaKgM2: number | null;
  velkostBaleniaKg: number;
  /** technologická prestávka PO tejto vrstve (hodiny) — pre časovú os */
  prestavkaHodiny?: number;
  poznamka?: string;
  volitelna?: boolean;
};

export type System = {
  id: string;
  /** zákaznícky názov — NIE „epoxid"/„polyuretán" */
  nazov: string;
  trieda: "standard" | "premium";
  /** čím sa systém predáva — 2–3 vlastnosti */
  vlastnosti: string[];
  podmienky: {
    co: Co[];
    kde: Kde[];
    /** prázdne pole = všetky priestory */
    priestor: string[];
    podklad: string[];
    vzhlad: string[];
  };
  vrstvy: Vrstva[];
};

/* ── Produkty použité v skladbách (SKU zodpovedá katalógu /eshop) ── */

export const PRODUKT = {
  primer01: { sku: "498421", nazov: "Sikafloor-01 Primer", spotreba: 0.1, balenie: 10 },
  primer03: { sku: "498434", nazov: "Sikafloor-03 Primer", spotreba: 0.15, balenie: 10 },
  level30: { sku: "162680", nazov: "Sikafloor Level-30", spotreba: 1.8, balenie: 25 },
  sf151: { sku: "SIKAFLOOR-151", nazov: "Sikafloor-151 Primer", spotreba: 0.4, balenie: 30 },
  sf150plus: { sku: "SF-150-PLUS", nazov: "Sikafloor-150 Plus", spotreba: 0.4, balenie: 25 },
  sf264: { sku: "SIKAFLOOR-264-30", nazov: "Sikafloor-264 Plus", spotreba: 1.5, balenie: 30 },
  sf3310: { sku: "SF-3310", nazov: "Sikafloor-3310", spotreba: 1.2, balenie: 20 },
  sf3000: { sku: "SIKAFLOOR-3000-21", nazov: "Sikafloor-3000", spotreba: 1.5, balenie: 20 },
  sf3000fx: { sku: "558772", nazov: "Sikafloor-3000 FX", spotreba: 2.8, balenie: 20 },
  lak304w: { sku: "SIKAFLOOR-304W-7.5", nazov: "Sikafloor-304W Matt", spotreba: 0.13, balenie: 7.5 },
  /* TopStone rad — dizajnové podlahy. Spotreby podľa systémov v NajCRM:
     EP02 penetrácia 2 vrstvy (2 × 0,4), EP11 báza 1,22, EP22 Plus 1,19 (2 vrstvy).
     Lak je TopStone EP22, nie Sikafloor-305/304 — Sika lak patrí k Sika systémom. */
  tsEp02: { sku: "TS-EP02", nazov: "TopStone EP02 penetrácia", spotreba: 0.8, balenie: 30 },
  tsEp11: { sku: "TS-EP11-METALLIC", nazov: "TopStone EP11 Metallic", spotreba: 1.22, balenie: 20 },
  tsEp22: { sku: "TS-EP22-PLUS", nazov: "TopStone EP22 Plus", spotreba: 1.19, balenie: 20 },
  piesok: {
    sku: "TS-KREMICITY-PIESOK-0-3-0-8-MM-",
    nazov: "Kremičitý piesok 0,3–0,8 mm",
    spotreba: 1.0,
    balenie: 25,
  },
  chipsy: { sku: "180050", nazov: "Chipsy (dekoračný posyp)", spotreba: null, balenie: 0.5 },
} as const;

/** Skratka na vrstvu z PRODUKT-u. */
function v(
  poradie: number,
  nazov: string,
  p: { sku: string; nazov: string; spotreba: number | null; balenie: number },
  extra: Partial<Vrstva> = {},
): Vrstva {
  return {
    poradie,
    nazov,
    produktSku: p.sku,
    produktNazov: p.nazov,
    spotrebaKgM2: p.spotreba,
    velkostBaleniaKg: p.balenie,
    ...extra,
  };
}

export const SYSTEMY: System[] = [
  /* ── PODLAHY ─────────────────────────────────────────────────────── */
  {
    id: "garaz-standard",
    nazov: "Standard — odolný jednofarebný povrch",
    trieda: "standard",
    vlastnosti: [
      "Vysoká oderuvzdornosť, znesie pneumatiky aj zdvihák",
      "Ľahká údržba, nesaje oleje ani soľ",
      "Najlepší pomer cena/výkon do garáže a dielne",
    ],
    podmienky: {
      co: ["podlaha", "schody"],
      kde: ["interier"],
      priestor: ["garaz", "priemysel", "ine"],
      podklad: ["beton", "cem_poter", "anhydrit", "stary_nater", "neviem"],
      // priemyselný vzhľad = ten istý tvrdý jednofarebný povrch
      vzhlad: ["jednofarebna", "priemyselna"],
    },
    vrstvy: [
      v(1, "Penetrácia", PRODUKT.sf151, { prestavkaHodiny: 12 }),
      v(2, "Hlavná vrstva", PRODUKT.sf264, { prestavkaHodiny: 24 }),
    ],
  },
  {
    id: "byt-premium-pu",
    nazov: "Premium — pružný liaty povrch do bývania",
    trieda: "premium",
    vlastnosti: [
      "Pružný, tlmí kroky a neprenáša chlad",
      "Bez škár, hygienický a ľahko umývateľný",
      "Farebne stály, nežltne pod vrchným lakom",
    ],
    podmienky: {
      co: ["podlaha", "schody"],
      kde: ["interier"],
      priestor: ["byt_dom", "ine"],
      podklad: ["beton", "cem_poter", "anhydrit", "neviem"],
      vzhlad: ["jednofarebna"],
    },
    vrstvy: [
      v(1, "Penetrácia", PRODUKT.sf151, { prestavkaHodiny: 12 }),
      v(2, "Hlavná vrstva", PRODUKT.sf3000, { prestavkaHodiny: 24 }),
      v(3, "Vrchný lak", PRODUKT.lak304w, { prestavkaHodiny: 24, poznamka: "2 vrstvy" }),
    ],
  },
  {
    id: "metalik-premium",
    nazov: "TopStone METALIC — dizajnový efekt",
    trieda: "premium",
    vlastnosti: [
      "Hĺbkový metalický efekt, každá podlaha originál",
      "Bezškárový povrch bez prechodov",
      "Uzatvorený lakom proti oderu a UV z okien",
    ],
    podmienky: {
      co: ["podlaha"],
      kde: ["interier"],
      priestor: ["byt_dom", "priemysel", "ine"],
      podklad: ["beton", "cem_poter", "anhydrit", "neviem"],
      vzhlad: ["metalik"],
    },
    vrstvy: [
      v(1, "Penetrácia", PRODUKT.tsEp02, { prestavkaHodiny: 12, poznamka: "2 vrstvy" }),
      v(2, "Metalická báza", PRODUKT.tsEp11, { prestavkaHodiny: 24 }),
      v(3, "Vrchný lak", PRODUKT.tsEp22, { prestavkaHodiny: 24, poznamka: "2 vrstvy" }),
    ],
  },
  {
    id: "marble-premium",
    nazov: "TopStone Mramor — mramorový efekt",
    trieda: "premium",
    vlastnosti: [
      "Jemná mramorová kresba na mieru",
      "Pružná vrstva, znesie mikropohyby podkladu",
      "Matný alebo lesklý finiš podľa vkusu",
    ],
    podmienky: {
      co: ["podlaha"],
      kde: ["interier"],
      priestor: ["byt_dom", "ine"],
      podklad: ["beton", "cem_poter", "anhydrit", "neviem"],
      vzhlad: ["marble"],
    },
    vrstvy: [
      v(1, "Penetrácia", PRODUKT.tsEp02, { prestavkaHodiny: 12, poznamka: "2 vrstvy" }),
      v(2, "Mramorová báza", PRODUKT.tsEp11, { prestavkaHodiny: 24, poznamka: "viacfarebné ťahanie" }),
      v(3, "Vrchný lak", PRODUKT.tsEp22, { prestavkaHodiny: 24, poznamka: "2 vrstvy" }),
    ],
  },
  {
    id: "chipsy-standard",
    nazov: "Standard Chips — pestrý protišmykový povrch",
    trieda: "standard",
    vlastnosti: [
      "Vločky zakryjú drobné nerovnosti aj nečistoty",
      "Prirodzene protišmykový povrch",
      "Obľúbený do garáží, dielní a technických miestností",
    ],
    podmienky: {
      co: ["podlaha", "schody"],
      kde: ["interier"],
      priestor: ["garaz", "priemysel", "byt_dom", "ine"],
      podklad: ["beton", "cem_poter", "anhydrit", "stary_nater", "neviem"],
      vzhlad: ["chipsy"],
    },
    vrstvy: [
      v(1, "Penetrácia", PRODUKT.sf151, { prestavkaHodiny: 12 }),
      v(2, "Hlavná vrstva", PRODUKT.sf264, { prestavkaHodiny: 2 }),
      v(3, "Dekoračný posyp", PRODUKT.chipsy, {
        prestavkaHodiny: 24,
        poznamka: "TODO: spotreba podľa hustoty posypu — doplní Tristan",
      }),
      v(4, "Vrchný lak", PRODUKT.lak304w, { prestavkaHodiny: 24, poznamka: "2 vrstvy" }),
    ],
  },
  {
    id: "exterier-pu",
    nazov: "Premium Exteriér — UV stály pružný povrch",
    trieda: "premium",
    vlastnosti: [
      "Nežltne na priamom slnku, odolá mrazu",
      "Pružný — prenesie tepelnú rozťažnosť podkladu",
      "Povinný protišmykový posyp v cene",
    ],
    podmienky: {
      co: ["podlaha", "schody"],
      kde: ["exterier"],
      priestor: ["terasa", "vonkajsia_garaz", "rampa", "ine"],
      podklad: ["beton", "cem_poter", "stary_nater", "neviem"],
      vzhlad: ["jednofarebna", "chipsy", "priemyselna"],
    },
    vrstvy: [
      v(1, "Penetrácia", PRODUKT.sf151, { prestavkaHodiny: 12 }),
      v(2, "Hlavná vrstva (UV stála)", PRODUKT.sf3310, { prestavkaHodiny: 2 }),
      v(3, "Protišmykový posyp", PRODUKT.piesok, {
        prestavkaHodiny: 12,
        poznamka: "V exteriéri povinný — bez neho je mokrý povrch klzký",
      }),
    ],
  },

  /* ── STENY (spotreby TODO — doplní Tristan) ──────────────────────── */
  {
    id: "stena-nater",
    nazov: "Standard — umývateľný stenový náter",
    trieda: "standard",
    vlastnosti: [
      "Umývateľný povrch odolný chémii",
      "Vhodný do prevádzok a technických priestorov",
      "Ľubovoľný odtieň RAL",
    ],
    podmienky: {
      co: ["stena"],
      kde: ["interier", "exterier"],
      priestor: ["kupelna", "kuchyna", "prevadzka", "priemyselna_stena", "fasada", "sokel", "oporny_mur"],
      podklad: ["beton", "cem_poter", "sadrokarton", "stary_nater", "neviem"],
      vzhlad: ["epoxidovy_nater"],
    },
    vrstvy: [
      v(1, "Penetrácia", { sku: "498434", nazov: "Sikafloor-03 Primer", spotreba: null, balenie: 10 }, {
        poznamka: "TODO: spotreba na stene — doplní Tristan",
      }),
      v(2, "Náter (2 vrstvy)", { sku: "SF-2510W", nazov: "Sikafloor-2510W", spotreba: null, balenie: 20 }, {
        poznamka: "TODO: spotreba na stene — doplní Tristan",
      }),
    ],
  },
  {
    id: "stena-dekor",
    nazov: "Premium — dekoratívny stenový efekt",
    trieda: "premium",
    vlastnosti: [
      "Metalické a betónové efekty na mieru",
      "Bezškárový povrch bez tapiet",
      "Vzorka odtieňa pred realizáciou",
    ],
    podmienky: {
      co: ["stena"],
      kde: ["interier"],
      priestor: ["obyvacka", "prevadzka", "kuchyna"],
      podklad: ["beton", "cem_poter", "sadrokarton", "stary_nater", "neviem"],
      vzhlad: ["dekor"],
    },
    vrstvy: [
      v(1, "Penetrácia", { sku: "498434", nazov: "Penetrácia pod dekor", spotreba: null, balenie: 10 }, {
        poznamka: "TODO: spotreba — doplní Tristan",
      }),
      v(2, "Dekoratívna vrstva", { sku: "TODO-DEKOR-STENA", nazov: "Dekoratívna stierka", spotreba: null, balenie: 20 }, {
        poznamka: "TODO: SKU a spotreba — doplní Tristan",
      }),
    ],
  },
];

export function getSystem(id: string): System | undefined {
  return SYSTEMY.find((s) => s.id === id);
}
