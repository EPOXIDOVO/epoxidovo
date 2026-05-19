/**
 * 4 výhody (USP) v kartách so symbolom navrchu — podľa briefu klienta.
 * Ikony zo lucide-react.
 */

export interface Benefit {
  icon: string; // lucide-react icon name
  title: string;
  description: string;
}

export const BENEFITS: Benefit[] = [
  {
    icon: "Sparkles",
    title: "Originál pre každý priestor",
    description:
      "Každá podlaha je ručne tvorená. Žiadne dva odlievy nie sú rovnaké — máš istotu, že tvoja vyzerá inak ako každá iná.",
  },
  {
    icon: "Shield",
    title: "Odolnosť na desaťročia",
    description:
      "Epoxid odoláva chemikáliám, oleju, oderu aj záťaži. Bez prachu, bez škár, bez údržby. Investícia, ktorá vydrží.",
  },
  {
    icon: "Droplets",
    title: "Hygienicky čistý povrch",
    description:
      "Bez špár, kde by sa zachytávala špina či baktérie. Stačí mokrý mop. Ideálne pre kuchyne, kúpeľne aj prevádzky.",
  },
  {
    icon: "Hammer",
    title: "Kompletná realizácia",
    description:
      "Od merania, návrhu a podkladu až po finálny lesk. Robíme všetko sami — žiadne subdodávky, žiadne výhovorky.",
  },
];
