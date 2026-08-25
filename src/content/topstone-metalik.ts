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
