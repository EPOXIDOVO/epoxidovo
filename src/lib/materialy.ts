import data from "@/content/materialy.json";
import extra from "@/content/materialy-extra.json";
import cenyOverride from "@/content/ceny-override.json";
import tlLokalne from "@/content/tl-lokalne.json";

/**
 * Materiály na predaj — dva zdroje:
 *  - materialy.json       — Sika + TopStone z CRM exportu
 *                           (refresh: `node scripts/import-materialy.mjs`)
 *  - materialy-extra.json — Arturo + UZIN z HA-UZ VOC cenníkov
 *                           (refresh: `node scripts/import-hauz.mjs`)
 * CRM re-import sa extra súboru nedotýka a naopak.
 *
 * Ceny sú FINÁLNE — firma je neplatiteľ DPH, nikde nezobrazujeme „bez DPH"
 * ani nepočítame DPH. Pevné ceny (cena_pevna) sa nikdy neprepočítavajú.
 */

export type Kategoria =
  | "Penetrácia"
  | "Hlavná vrstva"
  | "Vrchný lak"
  | "Nivelačná hmota"
  | "Doplnok";
export type Vyrobca = "Sika" | "TopStone" | "Arturo" | "UZIN";

export interface Material {
  sku: string;
  nazov: string;
  vyrobca: Vyrobca;
  kategoria: Kategoria;
  balenie: string | null;
  balenie_kg: number | null;
  cena_eur_s_dph: number;
  cena_pevna: boolean;
  spotreba_kg_m2: number | null;
  pokryje_m2_z_balenia: number | null;
  spotreba_poznamka: string | null;
  spracovatelnost_min: number | null;
  dalsia_vrstva_od_h: number | null;
  dalsia_vrstva_do_h: number | null;
  pochodzne_h: number | null;
  plne_vytvrdnute_dni: number | null;
  vyzaduje_podklad_mpa: number | null;
  technicky_list: string | null;
  typy_podlah: string[] | null;
  foto: string | null;
  /** "sud" = packshot balenia (biele pozadie, contain);
   *  "vzorka" = fotka vyliateho povrchu (full-bleed cover). */
  foto_typ?: "sud" | "vzorka" | null;
  /** Reálna fotka sudu/balenia ako malý inset na vzorke (vľavo dole). */
  foto_sud?: string | null;
  /** Fotka, na ktorú sa karta prepne pri hoveri (user si nahrá vlastné). */
  foto_hover?: string | null;
  foto_zdroj: string | null;
  foto_licencia: string | null;
}

/** Ručné cenové override-y (src/content/ceny-override.json, editor /admin/ceny).
 *  Prebijú cenu z importu a označia ju ako pevnú — import ich neprepíše. */
const CENY_OVERRIDE: Record<string, number> = cenyOverride.ceny;

/** Pôvodné ceny z importu (PRED override) — z nich sa dá spätne odvodiť nákup:
 *  vzorec cenotvorby je predaj = nákup s DPH ÷ 0,735, takže
 *  nákup s DPH = importná cena × 0,735 (neplatí pre cena_pevna z CRM). */
export const CENA_Z_IMPORTU: Record<string, { cena: number; pevna: boolean }> =
  Object.fromEntries(
    [...(data.produkty as Material[]), ...(extra.produkty as Material[])].map(
      (m) => [m.sku, { cena: m.cena_eur_s_dph, pevna: !!m.cena_pevna }],
    ),
  );

export const MATERIALY: Material[] = [
  ...(data.produkty as Material[]),
  ...(extra.produkty as Material[]),
].map((m) => ({
  ...m,
  ...(CENY_OVERRIDE[m.sku] != null
    ? { cena_eur_s_dph: CENY_OVERRIDE[m.sku], cena_pevna: true }
    : null),
  // lokálne kópie technických listov — button otvára PDF z našej domény
  ...((tlLokalne.tl as Record<string, string>)[m.sku]
    ? { technicky_list: (tlLokalne.tl as Record<string, string>)[m.sku] }
    : null),
}));
export const MATERIALY_SNAPSHOT: string = data.vygenerovane as string;

export const KATEGORIE: Kategoria[] = [
  "Penetrácia",
  "Hlavná vrstva",
  "Vrchný lak",
  "Nivelačná hmota",
  "Doplnok",
];
export const VYROBCOVIA: Vyrobca[] = ["Sika", "TopStone", "Arturo", "UZIN"];

export function getMaterial(sku: string): Material | undefined {
  return MATERIALY.find((m) => m.sku === sku);
}

/** Kremičité piesky — odporúčaný doplnok ku každej hlavnej vrstve.
 *  Spotreba živice v technickom liste je BEZ piesku; na 1 mm hrúbky
 *  treba navyše ~0,7–0,9 kg/m² piesku. */
export const PIESOK_SKUS = MATERIALY.filter(
  (m) =>
    /kremičit|piesok/i.test(m.nazov) &&
    m.kategoria === "Doplnok" &&
    !/múčka/i.test(m.nazov),
).map((m) => m.sku);

/** Polyuretánové systémy — robia sa LEN v 2 mm hrúbke (nie 1 mm). */
export const PU_2MM_SKUS = ["SIKAFLOOR-3000-21", "558772", "SF-3310"];

/** Farby kategórií pre placeholder vizuály (žiadne oficiálne fotky zatiaľ). */
export const KATEGORIA_STYLE: Record<
  Kategoria,
  { gradient: string; emoji: string }
> = {
  "Penetrácia": {
    gradient: "linear-gradient(135deg, #16a34a 0%, #14532d 100%)",
    emoji: "🧪",
  },
  "Hlavná vrstva": {
    gradient: "linear-gradient(135deg, #3db6e8 0%, #1a5f8a 100%)",
    emoji: "🪣",
  },
  "Vrchný lak": {
    gradient: "linear-gradient(135deg, #a855f7 0%, #4c1d95 100%)",
    emoji: "💧",
  },
  "Nivelačná hmota": {
    gradient: "linear-gradient(135deg, #64748b 0%, #1e293b 100%)",
    emoji: "🏗️",
  },
  "Doplnok": {
    gradient: "linear-gradient(135deg, #eab308 0%, #713f12 100%)",
    emoji: "🧰",
  },
};

/** Referenčná fotka hotovej podlahy podľa názvu produktu (vlastné realizácie).
 *  typy_podlah v exporte zatiaľ prázdne → heuristika podľa názvu. */
export function referencnaFotka(m: Material): {
  src: string;
  label: string;
} | null {
  if (m.kategoria !== "Hlavná vrstva") return null;
  const n = m.nazov.toLowerCase();
  if (/metalick|metallic|ep11|ep22/.test(n))
    return { src: "/images/categories/metalicke.jpg", label: "Metalická podlaha — naša realizácia" };
  if (/chips|vločk|flake/.test(n))
    return { src: "/images/categories/chipsove.jpg", label: "Chipsová podlaha — naša realizácia" };
  return { src: "/images/hero/byvanie-v2.webp", label: "Jednofarebná podlaha — naša realizácia" };
}

/** Koľko celých balení treba na danú plochu. Materiál sa predáva len
 *  v celých baleniach — zaokrúhľujeme NAHOR. */
export function baleniaNaPlochu(m: Material, plochaM2: number): number | null {
  if (!m.spotreba_kg_m2 || !m.balenie_kg || plochaM2 <= 0) return null;
  return Math.ceil((plochaM2 * m.spotreba_kg_m2) / m.balenie_kg);
}
