/**
 * Kategórie epoxidových podláh — poradie podľa briefu od klienta:
 * 1. Jednofarebné  2. Chipsové  3. Mramorové  4. Metalické
 */

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  image: string;
  driveCategory: string; // názov priečinku v Drive
  priceFrom: number; // €/m² od (0 = na zákazku)
  priceLabel?: string; // ak je nastavený, prebije priceFrom (napr. "Na zákazku")
}

export const CATEGORIES: Category[] = [
  {
    slug: "jednofarebne",
    name: "Jednofarebné",
    shortName: "Jednofarebné",
    tagline: "Čistá línia, nadčasová elegancia",
    description:
      "Minimalistické riešenie pre tých, čo hľadajú pokoj a poriadok. Hladký monolitický povrch v jednom odtieni — ideálny pre moderné interiéry, kuchyne a obchodné priestory.",
    image: "/images/categories/jednofarebne.jpg",
    driveCategory: "jednofarebna / minimalisticka",
    priceFrom: 70,
  },
  {
    slug: "chipsove",
    name: "Chipsové",
    shortName: "Chipsové",
    tagline: "Praktické s charakterom",
    description:
      "Farebné vločky (chipsy) zapečené v lesklom epoxide. Skvelo skrývajú nečistoty, sú odolné a vizuálne živé. Top voľba pre garáže, dielne a komerčné priestory.",
    image: "/images/categories/chipsove.jpg",
    driveCategory: "chipsova podlaha",
    priceFrom: 50,
  },
  {
    slug: "mramorove",
    name: "Mramorové",
    shortName: "Mramorové",
    tagline: "Luxus, ktorý sa nikde nezopakuje",
    description:
      "Ručne tvorené žilkovanie pripomínajúce skutočný mramor — každá podlaha je originál. Vytvára pocit luxusného priestoru bez nákladov na pravý kameň.",
    image: "/images/categories/mramorove.jpg",
    driveCategory: "mramorove efekty",
    priceFrom: 70,
  },
  {
    slug: "metalicke",
    name: "Metalické",
    shortName: "Metalické",
    tagline: "Hra svetla a hĺbky",
    description:
      "Pigmenty s metalickým efektom rozohrávajú podlahu pri každom kroku. 3D ilúzia, jedinečný odlesk a wow efekt — pre showroomy, prevádzky aj reprezentačné priestory.",
    image: "/images/categories/metalicke.jpg",
    driveCategory: "metalicke",
    priceFrom: 149,
  },
  {
    slug: "priemyselne",
    name: "Priemyselné",
    shortName: "Priemyselné",
    tagline: "Pre haly, výrobu a logistiku",
    description:
      "Odolné podlahy pre extrémne zaťaženie — výrobné haly, sklady, parkovacie domy. Antistatika (ESD), ATEX, protišmyk R9–R13, HACCP a líniové značenie podľa potreby prevádzky.",
    image: "/images/realizacie/r-22.jpg",
    driveCategory: "priemyselne",
    priceFrom: 0,
    priceLabel: "Cena na dopyt",
  },
];

/**
 * Typy priestorov — pre "Ukážky podláh" modal v Hero.
 * Po kliknutí sa zobrazí galéria fotiek z danej kategórie.
 */
export interface SpaceType {
  slug: string;
  name: string;
  description: string;
  driveCategory: string;
  icon: string; // lucide-react icon name
}

export const SPACE_TYPES: SpaceType[] = [
  {
    slug: "hala-firma",
    name: "Priemysel",
    description: "Haly, nemocnice, výroba, sklady",
    driveCategory: "Hala / Firma",
    icon: "Factory",
  },
  {
    slug: "dom",
    name: "Bývanie",
    description: "Domy, byty, interiéry",
    driveCategory: "dom (interier)",
    icon: "Home",
  },
  {
    slug: "garaz",
    name: "Garáž",
    description: "Garáže, dielne, parkovacie domy",
    driveCategory: "garaz",
    icon: "Car",
  },
];
