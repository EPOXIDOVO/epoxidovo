/**
 * Detailné info pre každú kategóriu — pre /sluzby/[slug] stránky.
 * Ceny sú orientačné — presné cenové ponuky robíme po obhliadke.
 */

export interface ServiceDetail {
  slug: string;
  intro: string;
  longDescription: string[];
  features: string[];
  bestFor: string[];
  priceRange: string; // orientačná cena za m²
  technicalSpecs: { label: string; value: string }[];
}

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  jednofarebne: {
    slug: "jednofarebne",
    intro:
      "Hladký monolitický povrch v jednom odtieni. Tichá elegancia, ktorá nestarne.",
    longDescription: [
      "Jednofarebné epoxidové podlahy sú prejavom čistého minimalistického dizajnu. Bez vzorov, bez šumu — len jeden priebežný odtieň od steny po stenu.",
      "Vďaka absencii škár získaš povrch, ktorý je extrémne ľahký na údržbu, hygienicky čistý a vizuálne pôsobí, akoby tvoja podlaha bola jediný kus skla. Pri správne pripravenom podklade vydrží desaťročia bez praskania a odlupovania.",
    ],
    features: [
      "Bez špár a prechodov",
      "Vyše 100 RAL odtieňov na výber",
      "Hladký matný alebo lesklý finish",
      "Hrúbka 1–3 mm podľa použitia",
      "Pochôdzna do 24 hodín",
    ],
    bestFor: [
      "Moderné kuchyne a obývačky",
      "Obchodné prevádzky a showroomy",
      "Kancelárie",
      "Bytové priestory",
    ],
    priceRange: "od 35 €/m²",
    technicalSpecs: [
      { label: "Hrúbka", value: "1–3 mm" },
      { label: "Pochôdznosť", value: "24 h" },
      { label: "Plne zaťažiteľné", value: "7 dní" },
      { label: "Životnosť", value: "20+ rokov" },
    ],
  },
  chipsove: {
    slug: "chipsove",
    intro:
      "Farebné vločky zaliate v lesklom epoxide. Praktické, odolné a vizuálne živé.",
    longDescription: [
      "Chipsová podlaha vznikne nasypaním malých farebných vločiek (chipsov) do čerstvej epoxidovej vrstvy. Po vytvrdnutí sa povrch zaleje transparentným epoxidom, ktorý vytvorí dokonale hladký a lesklý finish.",
      "Chipsy v rôznych farbách a veľkostiach krásne maskujú drobné nečistoty, čo robí túto podlahu ideálnou voľbou tam, kde sa intenzívne pracuje. Zároveň sú vizuálne dynamickejšie ako jednofarebné riešenia.",
    ],
    features: [
      "Skvele skrýva nečistoty",
      "Anti-slip varianta dostupná",
      "Farebné kombinácie chipsov na mieru",
      "Vysoká odolnosť voči oderu",
      "Estetika dielne aj domova",
    ],
    bestFor: [
      "Domáce a profesionálne garáže",
      "Dielne a hobby priestory",
      "Komerčné prevádzky",
      "Pivnice a technické miestnosti",
    ],
    priceRange: "od 42 €/m²",
    technicalSpecs: [
      { label: "Hrúbka", value: "2–4 mm" },
      { label: "Pochôdznosť", value: "36 h" },
      { label: "Plne zaťažiteľné", value: "7 dní" },
      { label: "Životnosť", value: "20+ rokov" },
    ],
  },
  mramorove: {
    slug: "mramorove",
    intro:
      "Ručne tvorené žilkovanie pripomínajúce skutočný mramor. Každá realizácia je originál.",
    longDescription: [
      "Mramorové epoxidové podlahy patria k vrcholu remeselného umenia. Vytvárame ich ručným nanášaním pigmentov, ktoré sa miešajú v lesklom epoxide a spontánne formujú jedinečné žilkovanie.",
      "Žiadne dva odlievy nie sú rovnaké. Toto je voľba pre tých, čo chcú v priestore niečo, čo sa nikde inde nezopakuje — kus umenia pod nohami namiesto bežnej dlažby.",
    ],
    features: [
      "Vždy originálny vzor",
      "Imitácia mramoru, betónu alebo achátu",
      "Kombinácia 2–5 odtieňov",
      "Vysokolesklý alebo polo-matný finish",
      "Bez prechodov, ako jeden kus",
    ],
    bestFor: [
      "Reprezentatívne obývačky",
      "Hotelové a wellness priestory",
      "Showroomy a butiky",
      "Kúpeľne a kuchyne",
    ],
    priceRange: "od 139 €/m²",
    technicalSpecs: [
      { label: "Hrúbka", value: "3–5 mm" },
      { label: "Pochôdznosť", value: "48 h" },
      { label: "Plne zaťažiteľné", value: "10 dní" },
      { label: "Životnosť", value: "20+ rokov" },
    ],
  },
  metalicke: {
    slug: "metalicke",
    intro:
      "Metalické pigmenty rozohrávajú podlahu pri každom kroku. 3D ilúzia hĺbky a wow efekt.",
    longDescription: [
      "Metalické podlahy sú spektakulárnou kombináciou epoxidu a metalických pigmentov, ktoré pri správnom svetle vytvárajú dojem hĺbky, pohybu a 3D ilúzie. Každý uhol pohľadu odhalí inú nuansu.",
      "Túto podlahu vyberajú tí, čo chcú urobiť silný vizuálny dojem — showroomy, reprezentačné priestory, ale aj odvážnejšie domácnosti. Zákazníci, hostia aj náhodní okoloidúci si ju jednoducho všimnú.",
    ],
    features: [
      "3D vizuálna hĺbka",
      "Hra svetla podľa uhla pohľadu",
      "Vyše 30 metalických pigmentov",
      "Možnosť kombinovať 2–4 farby",
      "Vysokolesklý finish",
    ],
    bestFor: [
      "Autoshowroomy",
      "Reprezentačné kancelárie",
      "Reštaurácie a bary",
      "Galérie a luxusné obývačky",
    ],
    priceRange: "od 75 €/m²",
    technicalSpecs: [
      { label: "Hrúbka", value: "3–5 mm" },
      { label: "Pochôdznosť", value: "48 h" },
      { label: "Plne zaťažiteľné", value: "10 dní" },
      { label: "Životnosť", value: "20+ rokov" },
    ],
  },
};
