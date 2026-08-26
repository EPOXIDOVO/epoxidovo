/**
 * Typ podlahy — jediný zdroj pravdy pre tagovanie fotiek, konfigurátor,
 * AI vizualizáciu aj cenovú ponuku. Každá fotka podlahy na webe MUSÍ
 * niesť jeden z týchto tagov; bez neho sa nedá z fotky spustiť
 * vizualizácia ani CP, takže ju TypeScript odmietne.
 */

export const TYPY_PODLAHY = [
  "metalicka",
  "jednofarebna",
  "chipsova",
  "priemyselna",
  "beton-look",
  "mramorova",
  "mistral",
] as const;

export type TypPodlahy = (typeof TYPY_PODLAHY)[number];

export const TYP_PODLAHY_LABEL: Record<TypPodlahy, string> = {
  metalicka: "Metalická",
  jednofarebna: "Jednofarebná",
  chipsova: "Chipsová",
  priemyselna: "Priemyselná",
  "beton-look": "Betón look",
  mramorova: "Mramorová",
  mistral: "Mistral",
};

/** Mapovanie na vzhľad v konfigurátore (src/lib/konfigurator/rules.ts). */
export const TYP_NA_VZHLAD: Record<TypPodlahy, string> = {
  metalicka: "metalik",
  jednofarebna: "jednofarebna",
  chipsova: "chipsy",
  priemyselna: "priemyselna",
  "beton-look": "beton_look",
  mramorova: "marble",
  // konfigurátor Mistral zatiaľ nepozná — berieme ho ako betón look
  mistral: "beton_look",
};

/** Starý slug kategórie na webe (/sluzby/…, categories.ts) → typ. */
export const SLUG_NA_TYP: Record<string, TypPodlahy> = {
  jednofarebne: "jednofarebna",
  chipsove: "chipsova",
  metalicke: "metalicka",
  mramorove: "mramorova",
  mistral: "mistral",
  priemyselne: "priemyselna",
  "beton-look": "beton-look",
};

/**
 * Typ podlahy → floor_type v NajCRM (lib/data/materials.ts). CRM pozná len
 * štyri; ostatné tri typy nemajú realizačné sadzby a CP pri nich ukáže
 * „cena na dopyt".
 */
export const TYP_NA_CRM: Partial<Record<TypPodlahy, "jednofarebna" | "chipsova" | "mramorova" | "metalicka">> = {
  jednofarebna: "jednofarebna",
  chipsova: "chipsova",
  mramorova: "mramorova",
  metalicka: "metalicka",
};

/** Fotka podlahy s povinným tagom a voliteľnou farbou. */
export type FotkaPodlahy = {
  src: string;
  typ: TypPodlahy;
  alt: string;
  /** RAL kód pri jednofarebných/priemyselných, názov efektu pri metalike a mramore. */
  farba?: string;
  /** Ľudský popis farby, ak sa líši od kódu („Antracit“, „Azuro modrá“). */
  farbaLabel?: string;
};
