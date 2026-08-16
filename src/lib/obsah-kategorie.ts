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

export const OBSAH_KATEGORIE: { id: string; label: string; test: (m: Material) => boolean }[] = [
  {
    id: "naradie",
    label: "Náradie a pomôcky",
    test: (m) =>
      /valec|valce|s.tetec|drz.iak|gumova. stierka|teleskopick|sitko|obuv|maskovacia|plechovka|vedro|kol.ik|vla.kna|pa.ska/.test(normalize(m.nazov)),
  },
  {
    id: "chipsy",
    label: "Chipsy a posypy",
    test: (m) => /chips|flakes|vloc.k|perlet|pearl/.test(normalize(m.nazov)),
  },
  {
    id: "piesky",
    label: "Piesky a plnivá",
    test: (m) => /piesok|mu.c.ka|plnivo|plastbet/.test(normalize(m.nazov)),
  },
  {
    id: "vsypy",
    label: "Vsypy do betónu",
    test: (m) => /armortop|syntop|metaltop/.test(normalize(m.nazov)),
  },
  {
    id: "kamenny-koberec",
    label: "Kamenný koberec",
    test: (m) =>
      /mramor|decormix|polyastone|purstone|epostone|topgel|toppur|topflex|toplock|topwall|designova|acryl decor|madeira|kre.ta|korfu|korsika|ja.va|elba|santorini|citystone|albunigru|cameo|concreto|griseo|latte|litore|mattone|\bdk (dark|light)/.test(normalize(m.nazov)),
  },
  {
    id: "prisady",
    label: "Prísady a tmely",
    test: (m) =>
      /thixo|stellmittel|stelmiddel|akcelera|accelerator|booster|tmel|topfiller|topstop|malta|buster/.test(normalize(m.nazov)),
  },
  {
    id: "nivelacie",
    label: "Nivelácie",
    test: (m) =>
      m.kategoria === "Nivelačná hmota" ||
      /level|fibrelevel|fiberlevel|decocem|scho.nox|nivelac/.test(normalize(m.nazov)),
  },
  {
    id: "potery",
    label: "Potery a opravy betónu",
    test: (m) => /hardtop|epocem|repair|tekuta. podloz.ka|sikagard/.test(normalize(m.nazov)),
  },
  { id: "penetracie", label: "Penetrácie", test: (m) => m.kategoria === "Penetrácia" },
  { id: "hlavne", label: "Hlavné vrstvy", test: (m) => m.kategoria === "Hlavná vrstva" },
  { id: "laky", label: "Vrchné laky", test: (m) => m.kategoria === "Vrchný lak" },
  { id: "ostatne", label: "Ostatné", test: () => true },
];

export function obsahKategoria(m: Material): string {
  return OBSAH_KATEGORIE.find((k) => k.test(m))!.id;
}

export function obsahLabel(id: string): string {
  return OBSAH_KATEGORIE.find((k) => k.id === id)?.label ?? id;
}
