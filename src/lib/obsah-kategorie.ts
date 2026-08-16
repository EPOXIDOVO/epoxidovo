import type { Material } from "@/lib/materialy";

/**
 * Obsahové kategórie produktov — zdieľané medzi katalógom (/eshop)
 * a adminom cien (/admin/ceny). Surová `kategoria` má len 5 hodnôt
 * a „Doplnok" je vrece so 137 položkami — delíme jemnejšie podľa názvov.
 * Prvé pravidlo, ktoré sedí, vyhráva.
 */

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export const OBSAH_KATEGORIE: { id: string; label: string; popis: string; test: (m: Material) => boolean }[] = [
  {
    id: "naradie",
    label: "Náradie a pomôcky",
    popis:
      "Valce na epoxidy a laky, gumové stierky, teleskopické tyče, sitká, miešacie vedrá, maskovacie pásky a podošvy s hrotmi — to isté náradie, s ktorým lejeme podlahy my. Bez poriadneho valca a mačiek sa liata podlaha robiť nedá.",
    test: (m) =>
      /valec|valce|s.tetec|drz.iak|gumova. stierka|teleskopick|sitko|obuv|maskovacia|plechovka|vedro|kol.ik|vla.kna|pa.ska/.test(normalize(m.nazov)),
  },
  {
    id: "chipsy",
    label: "Chipsy a posypy",
    popis:
      "Dekoračné vločky a perleťové kamienky na posyp epoxidových podláh — zakryjú drobné nerovnosti, pridajú protišmyk a dizajn. Sypú sa do čerstvej hlavnej vrstvy a uzatvárajú lakom.",
    test: (m) => /chips|flakes|vloc.k|perlet|pearl/.test(normalize(m.nazov)),
  },
  {
    id: "piesky",
    label: "Piesky a plnivá",
    popis:
      "Kremičité piesky a plnivá do epoxidov — zvýšia protišmyk, znížia spotrebu drahej živice pri stierkach a spevnia maltové zmesi. Na 1 mm hrúbky rátaj ~0,7–0,9 kg piesku na m².",
    test: (m) => /piesok|mu.c.ka|plnivo|plastbet/.test(normalize(m.nazov)),
  },
  {
    id: "vsypy",
    label: "Vsypy do betónu",
    popis:
      "Minerálne a metalické vsypy do čerstvého betónu — pancierová vrstva pre priemyselné podlahy s extrémnou záťažou. Aplikujú sa strojovo do ešte vlhkého betónu.",
    test: (m) => /armortop|syntop|metaltop/.test(normalize(m.nazov)),
  },
  {
    id: "kamenny-koberec",
    label: "Kamenný koberec",
    popis:
      "Kompletný systém kamenného koberca — mramorové a farbené kamienky, spojivá (PolyaStone, PurStone, EpoStone), DecorMix zmesi aj stenové varianty. Priepustný, príjemný naboso, ideálny na terasy, schody a okolie bazénov.",
    test: (m) =>
      /mramor|decormix|polyastone|purstone|epostone|topgel|toppur|topflex|toplock|topwall|designova|acryl decor|madeira|kre.ta|korfu|korsika|ja.va|elba|santorini|citystone|albunigru|cameo|concreto|griseo|latte|litore|mattone|\bdk (dark|light)/.test(normalize(m.nazov)),
  },
  {
    id: "prisady",
    label: "Prísady a tmely",
    popis:
      "Tixotropné prísady, urýchľovače, epoxidové tmely a protišmykové plnivá — drobnosti, ktoré rozhodujú: zahustenie na šikmé plochy, rýchlejšie vytvrdnutie v zime, opravy výtlkov.",
    test: (m) =>
      /thixo|stellmittel|stelmiddel|akcelera|accelerator|booster|tmel|topfiller|topstop|malta|buster/.test(normalize(m.nazov)),
  },
  {
    id: "nivelacie",
    label: "Nivelácie",
    popis:
      "Samonivelačné cementové stierky a potery na vyrovnanie podkladu pred liatou podlahou — od jemných 1–15 mm až po hrubé vrstvy do 50 mm. Rovný podklad je polovica úspechu každej epoxidovej podlahy.",
    test: (m) =>
      m.kategoria === "Nivelačná hmota" ||
      /level|fibrelevel|fiberlevel|decocem|scho.nox|nivelac/.test(normalize(m.nazov)),
  },
  {
    id: "potery",
    label: "Potery a opravy betónu",
    popis:
      "Epoxicementové stierky (EpoCem), rýchle potery HardTop a opravné malty — riešia vlhký podklad, zničený betón aj časový stres. EpoCem funguje aj na betóne bez parozábrany.",
    test: (m) => /hardtop|epocem|repair|tekuta. podloz.ka|sikagard/.test(normalize(m.nazov)),
  },
  { id: "penetracie", label: "Penetrácie", popis: "Základ pod každú epoxidovú aj PU podlahu — penetrácia uzavrie póry betónu, zvýši prídržnosť a zabráni bublinám. Vyber podľa podkladu: savý betón, zamastený, vlhký či anhydrit.", test: (m) => m.kategoria === "Penetrácia" },
  { id: "hlavne", label: "Hlavné vrstvy", popis: "Farebné epoxidové a polyuretánové hlavné vrstvy — jadro každej liatej podlahy. Ten istý materiál sa dá aplikovať ako tenký náter, 1 mm alebo 2 mm stierka — čím hrubšie, tým odolnejšie a drahšie. Kalkulačka na detaile produktu ti prepočíta spotrebu.", test: (m) => m.kategoria === "Hlavná vrstva" },
  { id: "laky", label: "Vrchné laky", popis: "Vrchné uzatváracie laky — chránia hlavnú vrstvu pred oderom a UV, zjednotia lesk/mat a uzavrú chipsy. Posledná vrstva každej kvalitnej podlahy.", test: (m) => m.kategoria === "Vrchný lak" },
  { id: "ostatne", label: "Ostatné", popis: "Špeciality, ktoré sa nezmestili inam — spojovacie mostíky, membrány a ďalšie produkty pre špecifické skladby.", test: () => true },
];

export function obsahKategoria(m: Material): string {
  return OBSAH_KATEGORIE.find((k) => k.test(m))!.id;
}

export function obsahLabel(id: string): string {
  return OBSAH_KATEGORIE.find((k) => k.id === id)?.label ?? id;
}

/**
 * Horná úroveň — 7 skupín zoradených podľa toho, ako sa podlaha stavia:
 * priprav → napenetruj → nalej → zalakuj → ozdob (+ prísady a náradie).
 * Deti odkazujú na id z OBSAH_KATEGORIE; „ostatne" (mostíky, membrány)
 * patrí k príprave podkladu.
 */
export const SKUPINY: { id: string; label: string; popis: string; deti: string[] }[] = [
  {
    id: "priprava",
    label: "Príprava podkladu",
    popis:
      "Prvý krok každej podlahy — vyrovnanie nivelačkou, oprava zničeného betónu, vsypy do čerstvých betónov aj spojovacie mostíky a membrány. Rovný a pevný podklad je polovica úspechu.",
    deti: ["nivelacie", "potery", "vsypy", "ostatne"],
  },
  { id: "penetracie", label: "Penetrácie", popis: "", deti: ["penetracie"] },
  { id: "hlavne", label: "Hlavné vrstvy", popis: "", deti: ["hlavne"] },
  { id: "laky", label: "Vrchné laky", popis: "", deti: ["laky"] },
  { id: "kamenny-koberec", label: "Kamenný koberec", popis: "", deti: ["kamenny-koberec"] },
  {
    id: "prisady",
    label: "Prísady a plnivá",
    popis:
      "Kremičité piesky, plnivá, dekoračné chipsy, tixotropné prísady, urýchľovače a tmely — drobnosti, ktoré menia spotrebu, protišmyk, dizajn aj rýchlosť vytvrdnutia.",
    deti: ["prisady", "piesky", "chipsy"],
  },
  { id: "naradie", label: "Náradie", popis: "", deti: ["naradie"] },
];

/** Skupina, do ktorej patrí obsahová kategória. */
export function skupinaPreObsah(obsahId: string): string {
  return SKUPINY.find((s) => s.deti.includes(obsahId))?.id ?? "priprava";
}

/** Popis skupiny — vlastný, alebo popis jediného dieťaťa. */
export function skupinaPopis(id: string): string {
  const sk = SKUPINY.find((s) => s.id === id);
  if (!sk) return "";
  if (sk.popis) return sk.popis;
  return OBSAH_KATEGORIE.find((k) => k.id === sk.deti[0])?.popis ?? "";
}
