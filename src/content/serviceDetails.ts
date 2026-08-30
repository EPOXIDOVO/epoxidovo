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
  // Priemyselné — kategória existuje v CATEGORIES a linkuje sa z /sluzby aj
  // zo sitemapy, ale detail tu chýbal → /sluzby/priemyselne vracalo 404.
  priemyselne: {
    slug: "priemyselne",
    intro:
      "Podlaha, ktorá znesie vysokozdvižný vozík, chémiu aj trojzmennú prevádzku.",
    longDescription: [
      "Priemyselná liata podlaha nerieši dizajn, ale prevádzku: koľko ton po nej denne prejde, čo na ňu vytečie a ako rýchlo sa dá po údržbe vrátiť do výroby. Podľa toho volíme systém — epoxidový, polyuretánový alebo ich kombináciu s kremičitým vsypom.",
      "Skladbu navrhujeme až po diagnostike podkladu: meriame vlhkosť, pevnosť v odtrhu a stav dilatácií. Do prevádzky potom vieme doplniť antistatiku (ESD), protišmyk v triedach R9–R13, HACCP-kompatibilný povrch pre potravinárstvo alebo ATEX riešenie do výbušného prostredia — vrátane líniového značenia a soklov.",
    ],
    features: [
      "Epoxid, polyuretán alebo hybridný systém",
      "Hrúbka 2–6 mm podľa zaťaženia",
      "ESD, HACCP, ATEX a protišmyk R9–R13 na požiadanie",
      "Líniové značenie a vyspádované sokle",
      "Etapová realizácia počas chodu prevádzky",
    ],
    bestFor: [
      "Výrobné a montážne haly",
      "Sklady a logistické centrá",
      "Parkovacie domy a rampy",
      "Potravinárske a farmaceutické prevádzky",
    ],
    priceRange: "cena na dopyt — podľa systému a zaťaženia",
    technicalSpecs: [
      { label: "Hrúbka", value: "2–6 mm" },
      { label: "Pochôdznosť", value: "24 h" },
      { label: "Plne zaťažiteľné", value: "7 dní" },
      { label: "Životnosť", value: "15–25 rokov podľa prevádzky" },
    ],
  },
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
    // 59 €/m² je jediná platná „od" cena — 35 tu zostalo z prvej verzie
    // a protirečilo categories.ts aj llms.txt (rozhodol majiteľ 2026-08-30).
    priceRange: "od 59 €/m²",
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
    priceRange: "od 49 €/m²",
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
    priceRange: "od 129 €/m²",
    technicalSpecs: [
      { label: "Hrúbka", value: "3–5 mm" },
      { label: "Pochôdznosť", value: "48 h" },
      { label: "Plne zaťažiteľné", value: "10 dní" },
      { label: "Životnosť", value: "20+ rokov" },
    ],
  },
  // Mistral a Concrete Look sú v CATEGORIES aktívne od 2026-08-25, ale detail
  // im tu chýbal → /sluzby/mistral aj /sluzby/beton-look padali na 404, hoci
  // na ne odkazuje menu, sitemap aj kalkulačka zisku na /kurz. Sú to
  // polyuretánové dizajnové stierky Arturo, nie epoxidy — texty to musia
  // hovoriť rovnako ako konfigurátor, inak si web protirečí.
  mistral: {
    slug: "mistral",
    intro:
      "Mäkký oblačný ťah v polyuretánovej stierke. Pokojná plocha bez ostrých hraníc a bez jedinej škáry.",
    longDescription: [
      "Mistral nie je epoxid — je to dizajnová polyuretánová stierka z kolekcie Arturo. Lejeme ju v 2 mm na penetráciu Arturo EP 6200 a zatvárame 2K polyuretánovým lakom. Oproti epoxidu je pružnejšia a UV stálejšia, takže odtieň znesie aj presvetlenú miestnosť.",
      "Kresbu ťaháme ručne hladidlom, takže na ploche nenájdeš opakujúci sa vzor — prechody sú jemné, bez ostrých hraníc. Na výber je 10 odtieňov radu Mistral — celý rad máš vo vzorkovníku. Vlastné realizačné fotky ešte dopĺňame, zatiaľ ukazujeme originálne vzorky výrobcu.",
    ],
    features: [
      "Polyuretán, nie epoxid — pružnejší a UV stálejší",
      "Liate 2 mm bez škár a prechodov",
      "10 odtieňov z kolekcie Arturo Mistral",
      "Ručný ťah — každá plocha vyzerá inak",
      "Uzavreté 2K polyuretánovým lakom",
    ],
    // presne tie priestory, ktoré uvádza description v categories.ts
    bestFor: [
      "Byty a obytné priestory",
      "Showroomy a predajne",
      "Ordinácie a čakárne",
    ],
    priceRange: "od 104 €/m²",
    technicalSpecs: [
      { label: "Hrúbka", value: "2 mm" },
      { label: "Systém", value: "Polyuretán (Arturo)" },
      // hodnoty držíme krátke — riadok je flex „label vs hodnota" a na
      // 375 px sa dlhší text zalomí na dva riadky
      { label: "Skladba", value: "EP 6200 → Mistral → 2K lak" },
      { label: "Odtiene", value: "10 v rade Mistral" },
      // konfigurátor Mistral rieši ako betón look, a ten je interiérový
      // (rules.ts, pravidlo 3b) — vonku ho mráz a vlhkosť rozrušia
      { label: "Použitie", value: "Iba interiér" },
    ],
  },
  "beton-look": {
    slug: "beton-look",
    intro:
      "Pohľadový betón bez škár, pórov a prachu. Dva milimetre polyuretánu, ktoré vyzerajú ako surová doska.",
    longDescription: [
      "Concrete Look dá ploche charakter surového betónu bez toho, aby si musel skutočný betón brúsiť a leštiť. Nosná vrstva je Arturo PU 2030 — UV stabilná a flexibilná polyuretánová stierka. Lejeme ju v 2 mm na penetráciu Arturo EP 6200 a zatvárame 2K polyuretánovým lakom.",
      "Odtiene berieme z dvoch radov Arturo, Concrete look a Concreta — spolu 29 variant, od pokojných až po výrazne kreslené. Ťahá sa to ručne, takže dve rovnaké plochy nevzniknú. Vlastné realizačné fotky ešte dopĺňame, zatiaľ ukazujeme originálne vzorky výrobcu.",
    ],
    features: [
      "Vzhľad pohľadového betónu, ale bez škár a pórov",
      "Arturo PU 2030 — UV stabilná a pružná stierka",
      "29 odtieňov z radov Concrete look a Concreta",
      "Liate 2 mm, uzavreté 2K PU lakom",
      "Údržba mopom — žiadne škáry, kde by sa držala špina",
    ],
    // POZOR: pri Concrete Look nikde v repe nie je, do akých priestorov ho
    // odporúčame (na rozdiel od Mistralu v categories.ts) — držíme sa preto
    // len interiérov, ktoré pravidlo 3b pripúšťa. Nech to majiteľ potvrdí.
    bestFor: [
      "Byty a obytné priestory",
      "Showroomy a predajne",
      "Kancelárie a recepcie",
    ],
    priceRange: "od 99 €/m²",
    technicalSpecs: [
      { label: "Hrúbka", value: "2 mm" },
      { label: "Systém", value: "Polyuretán (Arturo PU 2030)" },
      { label: "Skladba", value: "EP 6200 → PU 2030 → 2K lak" },
      { label: "Odtiene", value: "29 (Concrete look + Concreta)" },
      // rules.ts, pravidlo 3b — vonku ho mráz a vlhkosť rozrušia
      { label: "Použitie", value: "Iba interiér" },
    ],
  },
};
