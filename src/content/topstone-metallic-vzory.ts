/**
 * TopStone EP11 Metallic — oficiálne vzory od výrobcu.
 *
 * Zdroj fotiek: metalickasterka.cz (oficiálny web TopStone s.r.o. pre
 * metalické stierky), stiahnuté 2026-08-14 vo vysokom rozlíšení.
 * Licencia: produktové vzorky výrobcu použité na predaj jeho produktov
 * (sme dealer TopStone) — pri pochybnostiach potvrdiť s TopStone.
 *
 * Video výrobcu (vzory v akcii): https://www.youtube.com/watch?v=... —
 * na webe metalickasterka.cz, embedovať až po súhlase v cookies (Cookiebot).
 */

export interface MetallicVzor {
  slug: string;
  nazov: string;
  image: string;
}

const DIR = "/images/eshop/topstone-metallic";

export const TOPSTONE_METALLIC_VZORY: MetallicVzor[] = [
  { slug: "azuro", nazov: "Azuro", image: `${DIR}/azuro.jpg` },
  { slug: "burnt-orange", nazov: "Burnt orange", image: `${DIR}/burnt-orange.jpg` },
  { slug: "sequoia", nazov: "Sequoia", image: `${DIR}/sequoia.jpg` },
  { slug: "dark-brown", nazov: "Dark brown", image: `${DIR}/dark-brown.jpg` },
  { slug: "gun-metal", nazov: "Gun metal", image: `${DIR}/gun-metal.jpg` },
  { slug: "moose-green", nazov: "Moose green", image: `${DIR}/moose-green.jpg` },
  { slug: "gold", nazov: "Gold", image: `${DIR}/gold.jpg` },
  { slug: "brass", nazov: "Brass", image: `${DIR}/brass.jpg` },
  { slug: "midnight-blue", nazov: "Midnight blue", image: `${DIR}/midnight-blue.jpg` },
  { slug: "champagne", nazov: "Champagne", image: `${DIR}/champagne.jpg` },
  { slug: "royal-blue", nazov: "Royal Blue", image: `${DIR}/royal-blue.jpg` },
  { slug: "slate", nazov: "Slate", image: `${DIR}/slate.jpg` },
  { slug: "bronze", nazov: "Bronze", image: `${DIR}/bronze.jpg` },
  { slug: "white", nazov: "White", image: `${DIR}/white.jpg` },
  { slug: "copper", nazov: "Copper", image: `${DIR}/copper.jpg` },
  { slug: "wine-red", nazov: "Wine red", image: `${DIR}/wine-red.jpg` },
  { slug: "pearl", nazov: "Pearl", image: `${DIR}/pearl.jpg` },
  { slug: "charcoal", nazov: "Charcoal", image: `${DIR}/charcoal.jpg` },
];

/** SKU produktov, na ktorých sa zobrazuje galéria metalických vzorov. */
export const METALLIC_VZORY_SKUS = [
  "TS-EP11-METALLIC",
  "TS-DESIGNOVA-PODLAHA-EXCLUSIVE-",
];
