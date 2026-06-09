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

export type TextureSlug = "hladka" | "metalicka" | "chips" | "mramor";

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
};

// ════════════════════════════════════════════════════════════════════════
// RAL CLASSIC PALETTE
// ════════════════════════════════════════════════════════════════════════
// Curated subset najpopulárnejších RAL Classic farieb pre epoxidové podlahy.
// Použité v "Ďalšie farby" modali ako rozšírená paleta. Aplikovateľné LEN
// na hladkú textúru (Hladká), kde dáva zmysel uniformná farba.
// Pre metalické/mramor/chips zostávajú vlastné špeciálne presety.

interface RalColor {
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
  // Beiges / Browns
  { ral: "RAL 1001", name: "Béžová", hex: "#D0B084" },
  { ral: "RAL 8003", name: "Hlinková hnedá", hex: "#7B5141" },
  { ral: "RAL 8017", name: "Čokoládovo hnedá", hex: "#45322E" },
  // Blues
  { ral: "RAL 5010", name: "Encyánovo modrá", hex: "#0E294B" },
  { ral: "RAL 5015", name: "Nebesky modrá", hex: "#2271B3" },
  // Greens
  { ral: "RAL 6018", name: "Žltozelená", hex: "#57A639" },
  { ral: "RAL 6029", name: "Mätovo zelená", hex: "#20603D" },
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

/** Bezpečne nájde preset podľa textury + color slug-u.
 *  Hľadá najprv v hlavných COLORS, potom v RAL paletách. */
export function getColorPreset(
  texture: string,
  colorSlug: string,
): { texture: TextureDef; color: ColorPreset } | null {
  if (!isValidTextureSlug(texture)) return null;
  const tex = TEXTURES[texture];
  let color = COLORS[texture].find((c) => c.slug === colorSlug);
  if (!color) {
    // Fallback do RAL palety
    color = getRalColors(texture).find((c) => c.slug === colorSlug);
  }
  if (!color) return null;
  return { texture: tex, color };
}

export function isValidTextureSlug(s: string): s is TextureSlug {
  return s === "hladka" || s === "metalicka" || s === "chips" || s === "mramor";
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
