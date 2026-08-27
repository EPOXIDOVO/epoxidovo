/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";

/**
 * AI Vizualizér — predvolené textúry a farby.
 *
 * **DÔLEŽITÉ:** Tieto názvy sú **placeholder**. Sú nahradené finálnymi
 * obchodnými názvami pred go-live. Stačí upraviť `commercialName` v každom
 * preset-e — zvyšok kódu používa `slug` (immutable).
 *
 * Štruktúra promptu pre Gemini Nano Banana 2:
 *   "Replace the floor with a {textureBase}. Specifically: {colorPrompt}.
 *    Keep everything else identical including walls, furniture, lighting,
 *    perspective, and all objects on the floor."
 */

export type TextureSlug =
  | "hladka"
  | "metalicka"
  | "chips"
  | "mramor"
  | "mistral"
  | "beton";

/** Povrchový lak — len finálny topcoat, nezávislý od textúry/farby. */
export type Finish = "matna" | "leskla";

export const FINISHES: Record<Finish, { label: string; description: string }> = {
  leskla: {
    label: "Lesklá",
    description: "Vysoký lesk, sýta farba, viditeľné odrazy.",
  },
  matna: {
    label: "Matná",
    description: "Bez odrazov, moderný industriálny vzhľad.",
  },
};

export function isValidFinish(s: string): s is Finish {
  return s === "matna" || s === "leskla";
}

export interface TextureDef {
  slug: TextureSlug;
  label: string; // SK display name (Hladká)
  description: string; // krátky popis pod ikonkou
  /** Bázový text v prompte pre Gemini — opisuje povrch / dokončenie. */
  promptBase: string;
  /** CSS background pre vizuálny náhľad v pickeri (mini-vzor) — fallback. */
  swatchCss: React.CSSProperties;
  /** Reálna fotka z realizácie pre vizuálny náhľad (preferred over swatchCss). */
  previewImage?: string;
  /** Object-position pre fokus na podlahu v náhľade (napr. "center bottom"). */
  previewObjectPosition?: string;
}

export interface ColorPreset {
  slug: string; // URL-safe, unikátny v rámci textúry
  commercialName: string; // ⚠️ PLACEHOLDER — bude nahradené finálnym brandom
  hex: string; // CSS swatch farba (UI iba zobrazenie)
  /** Detailný popis farby pre AI — zahŕňa hex + RAL + textúru. */
  promptColor: string;
  /** TOP 4 najčastejšie volené farby per textúra — zobrazené v pickeri default,
   * zvyšok skrytý za "Ďalšie farby" tlačidlom (lepší UX, menej overwhelm). */
  featured?: boolean;
  /** Fotka reálnej vzorky — posiela sa AI ako referencia, aby efekt sedel 1:1. */
  refImage?: string;
}

// ════════════════════════════════════════════════════════════════════════
// TEXTÚRY
// ════════════════════════════════════════════════════════════════════════

// Poradie textúr v pickeri = poradie kľúčov v tomto Recorde (JS Object
// preserves insertion order). User požaduje: Jednofarebná, Chipsová,
// Mramorová, Metalická (rovnaké poradie ako v portfoliu).
// Slugy zostávajú pôvodné (hladka/chips/mramor/metalicka) — nemeníme aby
// nevybuchli URL params, DB záznamy, sessionStorage, atď.
export const TEXTURES: Record<TextureSlug, TextureDef> = {
  hladka: {
    slug: "hladka",
    label: "Jednofarebná",
    description: "Jednofarebný hladký epoxid",
    promptBase:
      "smooth seamless single-color epoxy floor with high-gloss mirror-like finish, professional photorealistic interior",
    swatchCss: {
      background:
        "linear-gradient(135deg, #4a5160 0%, #6b7385 45%, #4a5160 100%)",
      boxShadow: "inset 0 0 30px rgba(255,255,255,0.15)",
    },
    // Rovnaké náhľady ako v portfoliu (CATEGORIES.image v categories.ts)
    previewImage: "/images/categories/jednofarebne.jpg",
    previewObjectPosition: "center center",
  },
  chips: {
    slug: "chips",
    label: "Chipsová",
    description: "Dekoratívne vločky v epoxide",
    promptBase:
      "epoxy floor with evenly scattered multi-colored decorative vinyl chips/flakes " +
        "on RAL 7035 light grey base, very high chip density (70% coverage), mix of " +
        "black, dark grey, light grey, white and beige chip colors, chips are flat " +
        "and embedded in clear satin coat, uniform random distribution, no clustering, " +
        "no clear bare spots, professional photorealistic interior photography",
    swatchCss: {
      // Veľmi hustý chips pattern na RAL 7035 sivej (#D7D7D7) báze.
      // Layered radial-gradients vytvárajú efekt sypaných vločiek.
      backgroundColor: "#D7D7D7",
      backgroundImage: [
        // Tmavé chipsy
        "radial-gradient(circle, #1a1a1a 1.2px, transparent 1.7px)",
        "radial-gradient(circle, #333 1px, transparent 1.5px)",
        "radial-gradient(circle, #555 1.2px, transparent 1.7px)",
        // Stredne sivé
        "radial-gradient(circle, #777 1px, transparent 1.5px)",
        "radial-gradient(circle, #999 1.2px, transparent 1.7px)",
        // Svetlé / biele
        "radial-gradient(circle, #fff 1px, transparent 1.5px)",
        "radial-gradient(circle, #eee 1.2px, transparent 1.7px)",
        // Béžové akcenty
        "radial-gradient(circle, #b8a890 1px, transparent 1.5px)",
      ].join(", "),
      backgroundSize:
        "9px 9px, 13px 13px, 11px 11px, 15px 15px, 8px 8px, 12px 12px, 14px 14px, 16px 16px",
      backgroundPosition:
        "0 0, 4px 4px, 7px 2px, 2px 6px, 5px 1px, 1px 8px, 9px 5px, 6px 3px",
    },
    // Portfolio náhľad
    previewImage: "/images/categories/chipsove.jpg",
    previewObjectPosition: "center center",
  },
  mramor: {
    slug: "mramor",
    label: "Mramorová",
    description: "Mramorový vzor",
    promptBase:
      // **Locked design** — explicitný popis aby AI vygenerovala konzistentný
      // mramor pre všetkých užívateľov s rovnakou farbou.
      "luxury epoxy floor with realistic natural marble pattern, fine grey veining " +
        "running diagonally and curving organically through the surface, " +
        "vein thickness 1-3mm with varying opacity, mirror-polished high-gloss " +
        "finish, classic Italian marble aesthetic similar to Carrara/Calacatta, " +
        "professional photorealistic interior photography",
    swatchCss: {
      background:
        "linear-gradient(135deg, #f5f1ea 0%, #e8e2d5 25%, #f5f1ea 30%, #d4cdbf 50%, #f5f1ea 55%, #e8e2d5 80%, #f5f1ea 100%)",
    },
    previewImage: "/images/categories/mramorove.jpg",
    previewObjectPosition: "center center",
  },
  metalicka: {
    slug: "metalicka",
    label: "Metalická",
    description: "Trojrozmerný metalický efekt",
    promptBase:
      // **Locked design** — extra-detailný prompt pre konzistenciu naprieč
      // generáciami (užívateľ chce predvídateľné výsledky pri metalickej).
      "luxury 3D metallic epoxy floor with deep liquid pearlescent finish, " +
        "flowing organic swirls of varying tone density (60% base color, 40% lighter " +
        "highlights), mirror-polished reflective surface that catches and reflects " +
        "ambient light, no chunks or flakes, smooth flowing pigment patterns " +
        "reminiscent of poured metal, professional photorealistic interior photography, " +
        "high contrast reflections matching room lighting",
    swatchCss: {
      background:
        "conic-gradient(from 210deg at 30% 50%, #1e3a5f 0deg, #5a8ec4 90deg, #1e3a5f 180deg, #4a6f9e 270deg, #1e3a5f 360deg)",
      filter: "blur(0.3px)",
    },
    previewImage: "/images/categories/metalicke.jpg",
    previewObjectPosition: "center center",
  },
  mistral: {
    slug: "mistral",
    label: "Mistral",
    description: "Jemný melírovaný dekoratívny povrch",
    promptBase:
      "decorative troweled Mistral-style seamless floor with soft cloud-like washed tonal movement, gentle organic mottling and subtle lighter and darker veiling, fine sandy micro-texture, matte to soft-satin finish, no decorative chips and no marble veins, professional photorealistic interior photography",
    swatchCss: {
      background:
        "linear-gradient(120deg, #cdc7ba 0%, #b6b1a6 35%, #d8d2c4 60%, #b9b4ab 100%)",
    },
    previewImage: "/images/vzorkovnik/arturo/mistral-calm-breeze.webp",
    previewObjectPosition: "center center",
  },
  beton: {
    slug: "beton",
    label: "Concrete Look",
    description: "Betónový / mikrocementový vzhľad",
    promptBase:
      "seamless microcement concrete-look floor with smooth hand-troweled matte surface, subtle cloudy tonal variation and fine trowel marks, natural raw concrete aesthetic, soft mineral mottling, no glossy reflections and no decorative chips, professional photorealistic interior photography",
    swatchCss: {
      background:
        "linear-gradient(120deg, #c2beb6 0%, #a9a6a1 40%, #cfccc7 65%, #b0aca7 100%)",
    },
    previewImage: "/images/vzorkovnik/arturo/concrete-look-native-shadow.webp",
    previewObjectPosition: "center center",
  },
};

// ════════════════════════════════════════════════════════════════════════
// FARBY (per textúra)
// ⚠️ POZNÁMKA: Tieto commercialName sú PLACEHOLDER. Treba ich zameniť
//    finálnymi obchodnými názvami pred go-live (vid TODO v hlavičke).
// ════════════════════════════════════════════════════════════════════════

export const COLORS: Record<TextureSlug, ColorPreset[]> = {
  hladka: [
    // TOP 4 (featured: true) — biela, sivá nordická, antracit, pieskovec.
    // User feedback: na hladkej textúre dominujú tieto 4 najčastejšie voľby.
    {
      slug: "biela-snezna",
      commercialName: "Biela snežná",
      hex: "#f5f5f0",
      promptColor:
        "snow white color, exact hex #F5F5F0, clean and bright",
      featured: true,
    },
    {
      slug: "seda-nordicka",
      commercialName: "Šedá nordická",
      hex: "#8a9094",
      promptColor:
        "nordic cool grey color, exact hex #8A9094, slightly desaturated",
      featured: true,
    },
    {
      slug: "antracit",
      commercialName: "Antracit",
      hex: "#3a3d40",
      promptColor:
        "anthracite dark grey color, exact hex #3A3D40, smooth and uniform",
      featured: true,
    },
    {
      slug: "pieskovec",
      commercialName: "Pieskovec",
      hex: "#d4c5a8",
      promptColor:
        "warm sandstone beige color, exact hex #D4C5A8, smooth and uniform",
      featured: true,
    },
    {
      slug: "zemska-hneda",
      commercialName: "Zemská hnedá",
      hex: "#6e4f3a",
      promptColor:
        "earth brown color, exact hex #6E4F3A, warm and rich",
    },
    {
      slug: "betonova-seda",
      commercialName: "Betónová šedá",
      hex: "#a8a8a4",
      promptColor:
        "concrete grey color, exact hex #A8A8A4, industrial look",
    },
    {
      slug: "cierna",
      commercialName: "Onyx čierna",
      hex: "#1a1a1a",
      promptColor:
        "deep onyx black color, exact hex #1A1A1A, ultra glossy",
    },
    {
      slug: "krem",
      commercialName: "Krémová",
      hex: "#e8dcc0",
      promptColor:
        "cream off-white color, exact hex #E8DCC0, soft and warm",
    },
  ],
  metalicka: [
    // TOP 4 featured: najdramatickejšie + najčastejšie volené metaliky.
    {
      slug: "modra-hlbka",
      commercialName: "Modrá hĺbka",
      hex: "#1e3a5f",
      promptColor:
        "deep ocean blue with silver metallic swirls, exact base hex #1E3A5F, mirror-like reflections, fluid pearlescent effect",
      featured: true,
    },
    {
      slug: "strieborna-hmla",
      commercialName: "Strieborná hmla",
      hex: "#9aa5b1",
      promptColor:
        "silver mist metallic with platinum swirls, exact base hex #9AA5B1, soft pearlescent shimmer",
      featured: true,
    },
    {
      slug: "zlato-bronzova",
      commercialName: "Zlato-bronzová",
      hex: "#b8895c",
      promptColor:
        "gold-bronze metallic with copper swirls, exact base hex #B8895C, warm luxurious shimmer",
      featured: true,
    },
    {
      slug: "grafitova",
      commercialName: "Grafitová",
      hex: "#2c2c30",
      promptColor:
        "graphite black metallic with subtle silver veins, exact base hex #2C2C30, dramatic and elegant",
      featured: true,
    },
    {
      slug: "champagne",
      commercialName: "Champagne",
      hex: "#d4b78e",
      promptColor:
        "champagne pearl metallic with rose-gold swirls, exact base hex #D4B78E, soft luxury finish",
    },
    {
      slug: "sea-green",
      commercialName: "Smaragd",
      hex: "#1f5947",
      promptColor:
        "emerald green metallic with teal swirls, exact base hex #1F5947, jewel-tone depth",
    },
    {
      slug: "purple-haze",
      commercialName: "Ametyst",
      hex: "#4a3c5e",
      promptColor:
        "amethyst purple metallic with violet swirls, exact base hex #4A3C5E, mysterious depth",
    },
    {
      slug: "burgundy",
      commercialName: "Burgundské víno",
      hex: "#5c1f2e",
      promptColor:
        "burgundy wine metallic with copper swirls, exact base hex #5C1F2E, rich and warm",
    },

    // TopStone reálne efekty — prichádzajú predvolené z náhľadov fotiek na webe.
    {
      slug: "azuro",
      commercialName: "Azuro",
      hex: "#1493c2",
      promptColor:
        "TopStone Azuro — vivid azure blue metallic epoxy with turquoise and white pearlescent swirls, exact base hex #1493C2, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/azuro.jpg",
    },
    {
      slug: "gold",
      commercialName: "Gold",
      hex: "#c46004",
      promptColor:
        "TopStone Gold — rich golden amber metallic epoxy with bronze swirls, exact base hex #C46004, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/gold.jpg",
    },
    {
      slug: "copper",
      commercialName: "Copper",
      hex: "#d3851f",
      promptColor:
        "TopStone Copper — bright copper orange metallic epoxy with molten swirls, exact base hex #D3851F, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/copper.jpg",
    },
    {
      slug: "charcoal",
      commercialName: "Charcoal",
      hex: "#3c3d43",
      promptColor:
        "TopStone Charcoal — dark charcoal grey metallic epoxy with silver veining, exact base hex #3C3D43, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/charcoal.jpg",
    },
    {
      slug: "pearl",
      commercialName: "Pearl",
      hex: "#e1b087",
      promptColor:
        "TopStone Pearl — warm pearl beige metallic epoxy with champagne shimmer, exact base hex #E1B087, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/pearl.jpg",
    },
    {
      slug: "slate",
      commercialName: "Slate",
      hex: "#6b616c",
      promptColor:
        "TopStone Slate — muted slate grey-violet metallic epoxy with soft swirls, exact base hex #6B616C, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/slate.jpg",
    },
    {
      slug: "midnight-blue",
      commercialName: "Midnight Blue",
      hex: "#0d3680",
      promptColor:
        "TopStone Midnight Blue — deep midnight blue metallic epoxy with royal blue waves, exact base hex #0D3680, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/midnight-blue.jpg",
    },
    {
      slug: "moose-green",
      commercialName: "Moose Green",
      hex: "#337e5a",
      promptColor:
        "TopStone Moose Green — forest green metallic epoxy with emerald swirls, exact base hex #337E5A, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/moose-green.jpg",
    },
    {
      slug: "wine-red",
      commercialName: "Wine Red",
      hex: "#b13f07",
      promptColor:
        "TopStone Wine Red — deep wine red metallic epoxy with copper undertones, exact base hex #B13F07, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/wine-red.jpg",
    },
    {
      slug: "white",
      commercialName: "White",
      hex: "#dad7d3",
      promptColor:
        "TopStone White — bright white pearl metallic epoxy with subtle silver shimmer, exact base hex #DAD7D3, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/white.jpg",
    },
    {
      slug: "gun-metal",
      commercialName: "Gun Metal",
      hex: "#4b4c4f",
      promptColor:
        "TopStone Gun Metal — gun metal grey metallic epoxy with steel reflections, exact base hex #4B4C4F, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/gun-metal.jpg",
    },
    {
      slug: "sequoia",
      commercialName: "Sequoia",
      hex: "#c37548",
      promptColor:
        "TopStone Sequoia — warm sequoia terracotta metallic epoxy with amber swirls, exact base hex #C37548, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/sequoia.jpg",
    },
    {
      slug: "brass",
      commercialName: "Brass",
      hex: "#ea9731",
      promptColor:
        "TopStone Brass — bright brass yellow-gold metallic epoxy, exact base hex #EA9731, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/brass.jpg",
    },
    {
      slug: "bronze",
      commercialName: "Bronze",
      hex: "#3f2b14",
      promptColor:
        "TopStone Bronze — dark bronze brown metallic epoxy with golden veins, exact base hex #3F2B14, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/bronze.jpg",
    },
    {
      slug: "burnt-orange",
      commercialName: "Burnt Orange",
      hex: "#a77142",
      promptColor:
        "TopStone Burnt Orange — burnt orange metallic epoxy with rust swirls, exact base hex #A77142, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/burnt-orange.jpg",
    },
    {
      slug: "champagne-ts",
      commercialName: "Champagne TS",
      hex: "#685a63",
      promptColor:
        "TopStone Champagne TS — dusky champagne mauve metallic epoxy with pearl shimmer, exact base hex #685A63, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/champagne.jpg",
    },
    {
      slug: "dark-brown",
      commercialName: "Dark Brown",
      hex: "#b4866e",
      promptColor:
        "TopStone Dark Brown — chocolate brown metallic epoxy with caramel swirls, exact base hex #B4866E, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/dark-brown.jpg",
    },
    {
      slug: "royal-blue",
      commercialName: "Royal Blue",
      hex: "#28446c",
      promptColor:
        "TopStone Royal Blue — royal navy blue metallic epoxy with silver swirls, exact base hex #28446C, replicate the swirl pattern and colour of the reference sample photo exactly",
      refImage: "/images/eshop/topstone-metallic/royal-blue.jpg",
    },
  ],
  chips: [
    // TOP 4 featured: klasické chip blendy najčastejšie pre garáže / pivnice.
    {
      slug: "granit-klasik",
      commercialName: "Granit klasik",
      hex: "#9aa0a4",
      promptColor:
        "light grey base color (hex #9AA0A4) with evenly scattered grey, black and white vinyl chips, 50% chip coverage, natural granite look",
      featured: true,
    },
    {
      slug: "sahara-mix",
      commercialName: "Sahara mix",
      hex: "#d4be9a",
      promptColor:
        "warm beige base color (hex #D4BE9A) with evenly scattered tan, brown and white vinyl chips, 50% chip coverage, desert tones",
      featured: true,
    },
    {
      slug: "forest-bezova",
      commercialName: "Forest béžová",
      hex: "#c4b094",
      promptColor:
        "light olive-beige base color (hex #C4B094) with evenly scattered green, brown and cream vinyl chips, 50% chip coverage, natural earthy palette",
      featured: true,
    },
    {
      slug: "carbon-black",
      commercialName: "Carbon black flakes",
      hex: "#2a2a2a",
      promptColor:
        "deep black base color (hex #2A2A2A) with evenly scattered silver, white and grey vinyl chips, 50% chip coverage, dramatic contrast",
      featured: true,
    },
    {
      slug: "ocean-blue-mix",
      commercialName: "Ocean blue mix",
      hex: "#5a7a8c",
      promptColor:
        "blue-grey base color (hex #5A7A8C) with evenly scattered blue, white and silver vinyl chips, 50% chip coverage, marine palette",
    },
    {
      slug: "terracotta",
      commercialName: "Terakota",
      hex: "#b86b4a",
      promptColor:
        "terracotta orange base color (hex #B86B4A) with evenly scattered brown, cream and red vinyl chips, 50% chip coverage, warm Mediterranean palette",
    },
    {
      slug: "cosmic-grey",
      commercialName: "Cosmic grey",
      hex: "#5a5a60",
      promptColor:
        "medium grey base color (hex #5A5A60) with evenly scattered silver, black, blue and white vinyl chips, 60% chip coverage, multi-color galaxy effect",
    },
    {
      slug: "snow-pearl",
      commercialName: "Snow pearl",
      hex: "#ebe8e0",
      promptColor:
        "off-white pearl base color (hex #EBE8E0) with evenly scattered grey, beige and translucent vinyl chips, 40% chip coverage, clean minimalist look",
    },
  ],
  mramor: [
    // TOP 4 featured: klasické mramory najpopulárnejšie v luxusnych interiéroch.
    {
      slug: "carrara-biela",
      commercialName: "Carrara biela",
      hex: "#f0ede5",
      promptColor:
        "white Carrara marble pattern with delicate grey veining, exact base hex #F0EDE5, classic Italian marble look, polished finish",
      featured: true,
    },
    {
      slug: "onyx-cierna",
      commercialName: "Onyx čierna",
      hex: "#1a1a1d",
      promptColor:
        "black onyx marble pattern with white veining, exact base hex #1A1A1D, dramatic luxury look, mirror polish",
      featured: true,
    },
    {
      slug: "travertino-bez",
      commercialName: "Travertino béž",
      hex: "#d4c4a8",
      promptColor:
        "travertine beige marble pattern with subtle brown veining, exact base hex #D4C4A8, natural warm tones",
      featured: true,
    },
    {
      slug: "marquina-siva",
      commercialName: "Marquina sivá",
      hex: "#5a5a60",
      promptColor:
        "Marquina dark grey marble pattern with white veining, exact base hex #5A5A60, sophisticated contemporary",
      featured: true,
    },
    {
      slug: "calacatta-zlata",
      commercialName: "Calacatta zlatá",
      hex: "#ece5d4",
      promptColor:
        "Calacatta gold marble pattern with bold gold and grey veining, exact base hex #ECE5D4, luxury hotel look",
    },
    {
      slug: "emperador",
      commercialName: "Emperador hnedá",
      hex: "#6e4a30",
      promptColor:
        "Emperador brown marble pattern with light cream veining, exact base hex #6E4A30, rich earthy luxury",
    },
    {
      slug: "verde-alpi",
      commercialName: "Verde Alpi",
      hex: "#2a4a3a",
      promptColor:
        "Verde Alpi dark green marble pattern with white veining, exact base hex #2A4A3A, jewel-tone elegance",
    },
    {
      slug: "rosa-portugal",
      commercialName: "Rosa Portugal",
      hex: "#d4a896",
      promptColor:
        "Rosa Portugal pink marble pattern with darker rose veining, exact base hex #D4A896, soft romantic tones",
    },
  ],
  mistral: [
    {
      slug: "basic-wash",
      commercialName: "Basic Wash",
      hex: "#b5b2a5",
      promptColor:
        "Basic Wash washed decorative shade, base tone approximately hex #B5B2A5, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      featured: true,
      refImage: "/images/vzorkovnik/arturo/mistral-basic-wash.webp",
    },
    {
      slug: "calm-breeze",
      commercialName: "Calm Breeze",
      hex: "#dcd3c3",
      promptColor:
        "Calm Breeze washed decorative shade, base tone approximately hex #DCD3C3, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      featured: true,
      refImage: "/images/vzorkovnik/arturo/mistral-calm-breeze.webp",
    },
    {
      slug: "cosmic-fusion",
      commercialName: "Cosmic Fusion",
      hex: "#c5b8a1",
      promptColor:
        "Cosmic Fusion washed decorative shade, base tone approximately hex #C5B8A1, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/mistral-cosmic-fusion.webp",
    },
    {
      slug: "endless-beach",
      commercialName: "Endless Beach",
      hex: "#d8d2bf",
      promptColor:
        "Endless Beach washed decorative shade, base tone approximately hex #D8D2BF, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/mistral-endless-beach.webp",
    },
    {
      slug: "foggy-sky",
      commercialName: "Foggy Sky",
      hex: "#c4bfb6",
      promptColor:
        "Foggy Sky washed decorative shade, base tone approximately hex #C4BFB6, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/mistral-foggy-sky.webp",
    },
    {
      slug: "frozen-cosmos",
      commercialName: "Frozen Cosmos",
      hex: "#c1c4c8",
      promptColor:
        "Frozen Cosmos washed decorative shade, base tone approximately hex #C1C4C8, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/mistral-frozen-cosmos.webp",
    },
    {
      slug: "gentle-shade",
      commercialName: "Gentle Shade",
      hex: "#bfbdb4",
      promptColor:
        "Gentle Shade washed decorative shade, base tone approximately hex #BFBDB4, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/mistral-gentle-shade.webp",
    },
    {
      slug: "harsh-gravel",
      commercialName: "Harsh Gravel",
      hex: "#bab6b2",
      promptColor:
        "Harsh Gravel washed decorative shade, base tone approximately hex #BAB6B2, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/mistral-harsh-gravel.webp",
    },
    {
      slug: "ice-cave",
      commercialName: "Ice Cave",
      hex: "#9fb1b2",
      promptColor:
        "Ice Cave washed decorative shade, base tone approximately hex #9FB1B2, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      featured: true,
      refImage: "/images/vzorkovnik/arturo/mistral-ice-cave.webp",
    },
    {
      slug: "mixed-clay",
      commercialName: "Mixed Clay",
      hex: "#b6b1b3",
      promptColor:
        "Mixed Clay washed decorative shade, base tone approximately hex #B6B1B3, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      featured: true,
      refImage: "/images/vzorkovnik/arturo/mistral-mixed-clay.webp",
    },
  ],
  beton: [
    {
      slug: "basic-wash",
      commercialName: "Basic Wash",
      hex: "#b5b2a5",
      promptColor:
        "Basic Wash concrete-look microcement shade, base tone approximately hex #B5B2A5, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      featured: true,
      refImage: "/images/vzorkovnik/arturo/concrete-look-basic-wash.webp",
    },
    {
      slug: "cosmic-fusion",
      commercialName: "Cosmic Fusion",
      hex: "#cbbda6",
      promptColor:
        "Cosmic Fusion concrete-look microcement shade, base tone approximately hex #CBBDA6, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-cosmic-fusion.webp",
    },
    {
      slug: "dark-move",
      commercialName: "Dark Move",
      hex: "#46535d",
      promptColor:
        "Dark Move concrete-look microcement shade, base tone approximately hex #46535D, deep cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-dark-move.webp",
    },
    {
      slug: "downtown-mix",
      commercialName: "Downtown Mix",
      hex: "#4c4a4b",
      promptColor:
        "Downtown Mix concrete-look microcement shade, base tone approximately hex #4C4A4B, deep cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-downtown-mix.webp",
    },
    {
      slug: "foggy-sky",
      commercialName: "Foggy Sky",
      hex: "#c4beb6",
      promptColor:
        "Foggy Sky concrete-look microcement shade, base tone approximately hex #C4BEB6, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-foggy-sky.webp",
    },
    {
      slug: "fresh-power",
      commercialName: "Fresh Power",
      hex: "#e9e7dc",
      promptColor:
        "Fresh Power concrete-look microcement shade, base tone approximately hex #E9E7DC, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      featured: true,
      refImage: "/images/vzorkovnik/arturo/concrete-look-fresh-power.webp",
    },
    {
      slug: "frozen-cosmos",
      commercialName: "Frozen Cosmos",
      hex: "#c3c5c9",
      promptColor:
        "Frozen Cosmos concrete-look microcement shade, base tone approximately hex #C3C5C9, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-frozen-cosmos.webp",
    },
    {
      slug: "harsh-gravel",
      commercialName: "Harsh Gravel",
      hex: "#c2bcb8",
      promptColor:
        "Harsh Gravel concrete-look microcement shade, base tone approximately hex #C2BCB8, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-harsh-gravel.webp",
    },
    {
      slug: "ice-cave",
      commercialName: "Ice Cave",
      hex: "#9fb1b1",
      promptColor:
        "Ice Cave concrete-look microcement shade, base tone approximately hex #9FB1B1, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-ice-cave.webp",
    },
    {
      slug: "looming-dust",
      commercialName: "Looming Dust",
      hex: "#d5d1d4",
      promptColor:
        "Looming Dust concrete-look microcement shade, base tone approximately hex #D5D1D4, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-looming-dust.webp",
    },
    {
      slug: "mixed-clay",
      commercialName: "Mixed Clay",
      hex: "#b5b0b2",
      promptColor:
        "Mixed Clay concrete-look microcement shade, base tone approximately hex #B5B0B2, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-mixed-clay.webp",
    },
    {
      slug: "morning-flow",
      commercialName: "Morning Flow",
      hex: "#e9e6dc",
      promptColor:
        "Morning Flow concrete-look microcement shade, base tone approximately hex #E9E6DC, light airy cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-morning-flow.webp",
    },
    {
      slug: "native-shadow",
      commercialName: "Native Shadow",
      hex: "#9e9a95",
      promptColor:
        "Native Shadow concrete-look microcement shade, base tone approximately hex #9E9A95, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      featured: true,
      refImage: "/images/vzorkovnik/arturo/concrete-look-native-shadow.webp",
    },
    {
      slug: "nordic-night",
      commercialName: "Nordic Night",
      hex: "#2b4d60",
      promptColor:
        "Nordic Night concrete-look microcement shade, base tone approximately hex #2B4D60, deep cloudy mottled movement, match the color and pattern of the reference sample exactly",
      featured: true,
      refImage: "/images/vzorkovnik/arturo/concrete-look-nordic-night.webp",
    },
    {
      slug: "outback-dream",
      commercialName: "Outback Dream",
      hex: "#817060",
      promptColor:
        "Outback Dream concrete-look microcement shade, base tone approximately hex #817060, deep cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-outback-dream.webp",
    },
    {
      slug: "raw-basalt",
      commercialName: "Raw Basalt",
      hex: "#686e71",
      promptColor:
        "Raw Basalt concrete-look microcement shade, base tone approximately hex #686E71, deep cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-raw-basalt.webp",
    },
    {
      slug: "rough-lead",
      commercialName: "Rough Lead",
      hex: "#7e7d7c",
      promptColor:
        "Rough Lead concrete-look microcement shade, base tone approximately hex #7E7D7C, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-rough-lead.webp",
    },
    {
      slug: "soft-stone",
      commercialName: "Soft Stone",
      hex: "#b7b5b5",
      promptColor:
        "Soft Stone concrete-look microcement shade, base tone approximately hex #B7B5B5, soft mid cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-soft-stone.webp",
    },
    {
      slug: "velvet-blossom",
      commercialName: "Velvet Blossom",
      hex: "#775559",
      promptColor:
        "Velvet Blossom concrete-look microcement shade, base tone approximately hex #775559, deep cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-velvet-blossom.webp",
    },
    {
      slug: "volcano-flame",
      commercialName: "Volcano Flame",
      hex: "#97605b",
      promptColor:
        "Volcano Flame concrete-look microcement shade, base tone approximately hex #97605B, deep cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-volcano-flame.webp",
    },
    {
      slug: "worn-stuff",
      commercialName: "Worn Stuff",
      hex: "#677488",
      promptColor:
        "Worn Stuff concrete-look microcement shade, base tone approximately hex #677488, deep cloudy mottled movement, match the color and pattern of the reference sample exactly",
      refImage: "/images/vzorkovnik/arturo/concrete-look-worn-stuff.webp",
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════
// RAL CLASSIC PALETTE
// ════════════════════════════════════════════════════════════════════════
// Curated subset najpopulárnejších RAL Classic farieb pre epoxidové podlahy.
// Použité v "Ďalšie farby" modali ako rozšírená paleta. Aplikovateľné LEN
// na hladkú textúru (Hladká), kde dáva zmysel uniformná farba.
// Pre metalické/mramor/chips zostávajú vlastné špeciálne presety.

export interface RalColor {
  ral: string; // "RAL 7016"
  name: string; // "Antracit šedá"
  hex: string;
}

const RAL_CLASSIC: RalColor[] = [
  // Whites / Beiges
  { ral: "RAL 9010", name: "Čisto biela", hex: "#F7F7F1" },
  { ral: "RAL 9016", name: "Dopravná biela", hex: "#F1F1F1" },
  { ral: "RAL 9001", name: "Krémová biela", hex: "#EAE6CA" },
  { ral: "RAL 1015", name: "Slonová kosť", hex: "#E6D5B8" },
  { ral: "RAL 1013", name: "Perlovo biela", hex: "#E3D9C6" },
  // Greys
  { ral: "RAL 7035", name: "Svetlosivá", hex: "#D7D7D7" },
  { ral: "RAL 7038", name: "Achátsivá", hex: "#B5B8B1" },
  { ral: "RAL 7030", name: "Kamennosivá", hex: "#8B8C7A" },
  { ral: "RAL 7016", name: "Antracitsivá", hex: "#293133" },
  { ral: "RAL 7021", name: "Čiernosivá", hex: "#23282B" },
  { ral: "RAL 7047", name: "Telesivá 4", hex: "#C8C8C7" },
  // Beiges / Browns
  { ral: "RAL 1001", name: "Béžová", hex: "#D0B084" },
  { ral: "RAL 8003", name: "Hlinková hnedá", hex: "#7B5141" },
  { ral: "RAL 8017", name: "Čokoládovo hnedá", hex: "#45322E" },
  // Blues
  { ral: "RAL 5010", name: "Encyánovo modrá", hex: "#0E294B" },
  { ral: "RAL 5015", name: "Nebesky modrá", hex: "#2271B3" },
  { ral: "RAL 5012", name: "Svetlomodrá", hex: "#0089B6" },
  // Greens
  { ral: "RAL 6018", name: "Žltozelená", hex: "#57A639" },
  { ral: "RAL 6029", name: "Mätovo zelená", hex: "#20603D" },
  { ral: "RAL 6021", name: "Bledozelená", hex: "#89AC76" },
  // Reds
  { ral: "RAL 3000", name: "Ohňová červená", hex: "#AF2B1E" },
  { ral: "RAL 3009", name: "Oxidovo červená", hex: "#6D3F36" },
  // Black
  { ral: "RAL 9005", name: "Hĺbková čierna", hex: "#0A0A0A" },
];

/**
 * Vrcholy RAL Classic palety ako ColorPreset-y pre danú textúru.
 *
 * - "hladka": RAL je priama farba podlahy (smooth + uniform).
 * - "chips":  RAL je BÁZOVÁ farba pod-vrstvy, na ktorej sú rozsypané
 *             dekoratívne vinyl chipsy v komplementárnych tónoch.
 * - "metalicka" / "mramor": vlastné špec. presety (swirls / veining),
 *   RAL nie je sémanticky aplikovateľný → vraciame [].
 *
 * Slug formát: "ral-9010" (lowercase, bez medzery).
 */
export function getRalColors(texture: TextureSlug): ColorPreset[] {
  if (texture !== "hladka" && texture !== "chips") return [];

  return RAL_CLASSIC.map((r) => {
    const hexUpper = r.hex.toUpperCase();
    const nameLower = r.name.toLowerCase();
    // Per-textúra prompt template aby AI vedela ako interpretovať RAL.
    const promptColor =
      texture === "hladka"
        ? `${nameLower} color matching ${r.ral} specification, exact hex ${hexUpper}, smooth and uniform`
        : `${nameLower} base color matching ${r.ral} specification (exact hex ${hexUpper}) with evenly scattered complementary vinyl chips in matching tones, 50% chip coverage, natural decorative pattern`;
    return {
      slug: r.ral.toLowerCase().replace(/\s+/g, "-"),
      commercialName: `${r.ral} · ${r.name}`,
      hex: r.hex,
      promptColor,
    };
  });
}

// ════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════

/**
 * Bezpečne nájde preset podľa textury + color slug-u.
 *
 * Slug formáty (podporované per textúra):
 * - Hladka / Chips / Mramor (predefinované): jednoduchý slug (napr. "antracit")
 * - RAL: "ral-9010"
 * - Mramor compound (báza + žilkovanie): "ral-9010:ral-7016"
 *   → base = RAL 9010, vein = RAL 7016
 * - Metalicka compound (zmes 1-3 farieb): "ral-5010+ral-7035+ral-9005"
 *   → mixované farby v pearlescent swirloch
 *
 * Validuje voči predefinovaným zoznamom — prompt injection nemožný.
 */
export function getColorPreset(
  texture: string,
  colorSlug: string,
): { texture: TextureDef; color: ColorPreset } | null {
  if (!isValidTextureSlug(texture)) return null;
  const tex = TEXTURES[texture];

  // Compound: mramor base:vein
  if (texture === "mramor" && colorSlug.includes(":")) {
    const [baseSlug, veinSlug] = colorSlug.split(":");
    const baseRal = findRalRaw(baseSlug);
    const veinRal = findRalRaw(veinSlug);
    if (!baseRal || !veinRal) return null;
    return {
      texture: tex,
      color: {
        slug: colorSlug,
        commercialName: `${baseRal.name} · žilky ${veinRal.name}`,
        hex: baseRal.hex,
        promptColor:
          `realistic natural marble pattern with ${baseRal.name.toLowerCase()} base ` +
          `(exact hex ${baseRal.hex.toUpperCase()}, matching RAL ${baseRal.ral.replace("RAL ", "")}) ` +
          `and ${veinRal.name.toLowerCase()} veining ` +
          `(exact hex ${veinRal.hex.toUpperCase()}, matching RAL ${veinRal.ral.replace("RAL ", "")}). ` +
          `USE THE ADDITIONAL REFERENCE IMAGES (provided after the room photo) as STYLE GUIDE for the veining pattern — ` +
          `VARYING vein thickness (fine 0.5-1mm hairlines mixed with bold 3-8mm marbled strokes), ` +
          `veins go in DIFFERENT directions (diagonals, curves, branching), organic NOT uniform, ` +
          `veins fork like tree roots, some areas dense, other areas mostly clean base. ` +
          `Recolor the reference pattern: base color = ${baseRal.hex.toUpperCase()}, veins = ${veinRal.hex.toUpperCase()}. ` +
          `Mirror-polished surface, classic luxury natural marble aesthetic`,
      },
    };
  }

  // Compound: metalicka zmes 1-3 farieb (oddelené +)
  if (texture === "metalicka" && colorSlug.includes("+")) {
    const slugs = colorSlug.split("+");
    if (slugs.length === 0 || slugs.length > 3) return null;
    const rals = slugs.map((s) => findRalRaw(s));
    if (rals.some((r) => !r)) return null;
    const colors = rals as RalColor[];
    let promptColor: string;
    if (colors.length === 1) {
      promptColor =
        `metallic epoxy floor with ${colors[0].name.toLowerCase()} primary tone ` +
        `(exact hex ${colors[0].hex.toUpperCase()}). ` +
        `USE THE ADDITIONAL REFERENCE PHOTOS (provided after the room photo) as STYLE GUIDE — ` +
        `even single-color metallic epoxy is NEVER monotone — natural pigment SETTLES into ` +
        `flowing tonal variations: lighter highlights and darker shadows blend organically across the floor, ` +
        `pearlescent shimmer follows the swirl patterns from the references. Mirror-polished, ` +
        `poured-resin look. Recolor reference style to match base ${colors[0].hex.toUpperCase()}`;
    } else {
      const colorList = colors
        .map((c) => `${c.name.toLowerCase()} (hex ${c.hex.toUpperCase()})`)
        .join(", ");
      promptColor =
        `metallic epoxy floor with MULTIPLE colors that ACTUALLY BLEND TOGETHER like liquid metal poured ` +
        `and swirled: ${colorList}. ` +
        `CRITICAL: USE THE REFERENCE PHOTOS (provided after the room photo) as STYLE GUIDE — ` +
        `colors must FLOW into each other in organic pearlescent swirls, NO sharp boundaries between colors, ` +
        `NO color blocks — think of pouring different paint pigments and watching them marble. ` +
        `Lighter and darker tones create depth and movement across the entire floor. ` +
        `Approximately 50% ${colors[0].name.toLowerCase()} with ${colors
          .slice(1)
          .map((c) => c.name.toLowerCase())
          .join(" + ")} mixing through in flowing tonal swirls. ` +
        `Mirror-polished pearlescent surface with strong specular highlights`;
    }
    return {
      texture: tex,
      color: {
        slug: colorSlug,
        commercialName:
          colors.length === 1
            ? colors[0].name
            : `Zmes ${colors.map((c) => c.name).join(" + ")}`,
        hex: colors[0].hex,
        promptColor,
      },
    };
  }

  // Single slug — existujúce COLORS alebo RAL paleta
  let color = COLORS[texture].find((c) => c.slug === colorSlug);
  if (!color) {
    color = getRalColors(texture).find((c) => c.slug === colorSlug);
  }
  if (!color) return null;
  return { texture: tex, color };
}

/** Internal helper — nájde RAL farbu podľa slug-u v RAL_CLASSIC katalógu. */
function findRalRaw(slug: string): RalColor | null {
  const normalizedSlug = slug.toLowerCase();
  return (
    RAL_CLASSIC.find(
      (r) => r.ral.toLowerCase().replace(/\s+/g, "-") === normalizedSlug,
    ) ?? null
  );
}

/**
 * Vráti celú RAL paletu pre potreby UI — používa sa v metallic mix picker-i
 * a v "Ďalšie farby" module pre hladka/chips.
 */
export function getRalCatalog(): RalColor[] {
  return RAL_CLASSIC;
}

/**
 * Filtrovaná RAL paleta pre MRAMOR — len prírodné mramorové tóny.
 * Reálne mramory existujú vo whites, beiges, greys, blacks a browns.
 * Modré/zelené/červené/žlté žilky neexistujú v prírode (s výnimkou
 * Rosso Levanto kde je červená BÁZA, nie žilky) → vypadnú.
 *
 * Vyberáme RAL kódy podľa prefix-u (whites=9xxx/1xxx, greys=7xxx, browns=8xxx).
 */
export function getRalForMarble(): RalColor[] {
  return RAL_CLASSIC.filter((r) => {
    const code = r.ral.replace("RAL ", "");
    const prefix = code[0];
    // 9xxx = whites/black, 1xxx = beige/ivory, 7xxx = greys, 8xxx = browns
    return prefix === "9" || prefix === "1" || prefix === "7" || prefix === "8";
  });
}

export function ralSlug(ral: RalColor): string {
  return ral.ral.toLowerCase().replace(/\s+/g, "-");
}

// ════════════════════════════════════════════════════════════════════════
// REFERENCE PORTFOLIO IMAGES — pre style-guided generáciu
// ════════════════════════════════════════════════════════════════════════
// Pre mramor/metalicka posielame Geminimu okrem user-ovej fotky aj 1-2
// reálne portfólio fotky ako STYLE REFERENCE. AI tým napodobní reálny vein
// pattern / metalický swirl namiesto generovať generický vzor z hlavy.
//
// Hladká + Chipsová: bez referencií (jednoduchšie textúry, generic OK).

// Curated reference fotky — close-up vzorky reálnych mramorov / metalík.
// Nakopírované z user-ovho desktopu (skutočné realizácie + sample fotky).
// Mramor: rôzne typy žiliek (jemné/hrubé/rozličné smery)
// Metalika: dôraz na BLENDED tóny (farby sa miešajú v swirloch — to bola
//           hlavná pripomienka usera, AI generovala monotónny color)
const REFERENCE_IMAGES: Record<TextureSlug, string[]> = {
  hladka: [],
  chips: [],
  mramor: [
    "/images/visualizer-refs/mramor1.webp",
    "/images/visualizer-refs/mramor2.jpg",
    "/images/visualizer-refs/mramor3.jpg",
    "/images/visualizer-refs/mramor4.jpg",
  ],
  metalicka: [
    "/images/visualizer-refs/metalic-blue-silver.jpg", // klasický blue+silver blend
    "/images/visualizer-refs/metalic1.jpg",
    "/images/visualizer-refs/metalic5.jpg",
    "/images/visualizer-refs/metalic7.jpg",
  ],
  mistral: [
    "/images/vzorkovnik/arturo/mistral-basic-wash.webp",
    "/images/vzorkovnik/arturo/mistral-calm-breeze.webp",
    "/images/vzorkovnik/arturo/mistral-mixed-clay.webp",
  ],
  beton: [
    "/images/vzorkovnik/arturo/concrete-look-native-shadow.webp",
    "/images/vzorkovnik/arturo/concrete-look-fresh-power.webp",
    "/images/vzorkovnik/arturo/concrete-look-basic-wash.webp",
  ],
};

/**
 * Vráti cesty k portfolio reference fotkám pre danú textúru.
 * Volajúci si ich potom musí fetch-núť + base64-ovať pred poslaním do Gemini.
 */
export function getReferenceImagePaths(texture: TextureSlug): string[] {
  return REFERENCE_IMAGES[texture] ?? [];
}

export function isValidTextureSlug(s: string): s is TextureSlug {
  return (
    s === "hladka" ||
    s === "metalicka" ||
    s === "chips" ||
    s === "mramor" ||
    s === "mistral" ||
    s === "beton"
  );
}

/**
 * Vytvorí finálny prompt pre Gemini Nano Banana 2.
 * Kombinuje textureBase + colorPrompt + ochranné inštrukcie aby AI
 * nezmenila iné časti fotky.
 */
export function buildGeminiPrompt(
  texture: TextureDef,
  color: ColorPreset,
  finish: Finish,
): string {
  // Finish dominuje nad pôvodným promptBase (ten môže obsahovať "high-gloss"
  // ako default) — koncový override určuje finálny lak.
  // Posilnená wording aby AI urobila VIDITEĽNE iný výsledok od originálu —
  // user feedback: matná občas vyzerala rovnako ako pôvodná lesklá podlaha.
  const finishInstruction =
    finish === "matna"
      ? "FINAL FINISH (CRITICAL): The new floor MUST have a clearly MATTE, completely non-reflective surface. Eliminate ALL specular highlights, mirror reflections, and shiny spots. Surface should look like soft chalky concrete-style matte — visibly different from any glossy original floor. Diffuse light scattering only, no light source reflections visible on the floor."
      : "FINAL FINISH (CRITICAL): The new floor MUST have a strongly HIGH-GLOSS, mirror-like reflective surface. Strong specular highlights, visible reflections of ceiling lights and nearby objects on the floor, wet-look shine — visibly more glossy than typical matte floors.";

  return [
    `Task: Completely REPLACE the existing floor surface in this photo with a brand new ${texture.promptBase}.`,
    `New floor color and pattern: ${color.promptColor}.`,
    finishInstruction,
    `ABSOLUTE REQUIREMENT — the new floor must be IMMEDIATELY recognizable as a transformation. The original floor pattern, original color, original texture must NOT be visible in the result. The new floor entirely covers the old floor surface end-to-end. If the original floor had wood grain → the new floor has NO wood grain. If original was tile → NO grout lines visible. If original was painted concrete → that finish is GONE and replaced.`,
    `CRITICAL — keep everything ELSE in the photo identical:`,
    `- All walls, ceiling, doors, windows unchanged`,
    `- All furniture, objects, items on the floor preserved in their exact positions and exact same appearance`,
    `- Lighting source positions, shadow angles, perspective unchanged`,
    `- People or body parts visible unchanged`,
    `- Cables, electronics, boxes, anything on the floor preserved`,
    `Photorealistic, professional interior photography. The result should look like the same room photographed after installing the new epoxy floor.`,
  ].join(" ");
}
