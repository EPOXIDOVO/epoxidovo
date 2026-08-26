/**
 * Kolekcia TopStone EP11 Metallic — 18 odtieňov, jeden zdroj pravdy.
 *
 * Zoznam bol predtým na troch miestach (vzorkovník, konfigurátor materiálu,
 * presety vizualizéra) a rozišiel sa — vzorkovník ukazoval 12 z 18. Kto
 * pridáva odtieň, pridáva ho SEM; fotka patrí do
 * /public/images/eshop/topstone-metallic/<id>.jpg.
 */

export type MetalikEfekt = { id: string; label: string; src: string };

const efekt = (id: string, label: string): MetalikEfekt => ({
  id,
  label,
  src: `/images/eshop/topstone-metallic/${id}.jpg`,
});

export const TOPSTONE_METALIK: MetalikEfekt[] = [
  efekt("sequoia", "Sequoia"),
  efekt("charcoal", "Charcoal"),
  efekt("azuro", "Azuro"),
  efekt("copper", "Copper"),
  efekt("pearl", "Pearl"),
  efekt("slate", "Slate"),
  efekt("gold", "Gold"),
  efekt("midnight-blue", "Midnight Blue"),
  efekt("moose-green", "Moose Green"),
  efekt("wine-red", "Wine Red"),
  efekt("white", "White"),
  efekt("gun-metal", "Gun Metal"),
  efekt("brass", "Brass"),
  efekt("bronze", "Bronze"),
  efekt("burnt-orange", "Burnt Orange"),
  efekt("champagne", "Champagne"),
  efekt("dark-brown", "Dark Brown"),
  efekt("royal-blue", "Royal Blue"),
];

/**
 * Ukážkové kombinácie odtieňov — do jednej podlahy sa dajú zliať dva alebo
 * tri pigmenty. Fotky reálnych realizácií dodá klient; kým nie sú, dlaždica
 * ukáže „Čoskoro" a vypíše, z čoho sa kombinácia skladá.
 *
 * Keď fotka pribudne, stačí doplniť `foto` — nič iné sa nemení.
 */
export type Kombinacia = {
  id: string;
  /** id odtieňov z TOPSTONE_METALIK, v poradí ako sa lejú */
  zlozky: string[];
  foto?: string;
};

export const KOMBINACIE: Kombinacia[] = [
  { id: "charcoal-azuro", zlozky: ["charcoal", "azuro"] },
  { id: "copper-sequoia-white", zlozky: ["copper", "sequoia", "white"] },
  // tretiu vybral Claude, kým klient nepovie inak — zlato proti antracitu
  { id: "gold-charcoal", zlozky: ["gold", "charcoal"] },
];

/** Názov kombinácie do UI, napr. „Charcoal + Azuro". */
export function nazovKombinacie(k: Kombinacia): string {
  return k.zlozky
    .map((id) => TOPSTONE_METALIK.find((e) => e.id === id)?.label ?? id)
    .join(" + ");
}
