/**
 * FÁZA 5 — „sady" = predpripravené balíky na typické plochy.
 * Interne obsahujú TIE ISTÉ položky ako kalkulátor (počítajú sa cez
 * calcSystem pri renderi — žiadne duplicitné čísla, žiadny drift cien).
 */

export interface Sada {
  id: string;
  name: string;
  systemId: string;
  areaM2: number;
  reservePct: number;
  thicknessMm?: number;
  image: string;
  description: string;
}

export const SADY: Sada[] = [
  {
    id: "sada-garaz-20",
    name: "Sada: Garáž 20 m² — jednofarebný epoxid",
    systemId: "garaz-jednofarebna-epoxid",
    areaM2: 20,
    reservePct: 5,
    // jednofarebná podlaha — fotka musí sedieť s popisom (garaz.webp je metalická)
    image: "/images/categories/jednofarebne.jpg",
    description:
      "Kompletný materiál na jednofarebnú epoxidovú podlahu v garáži pre 1 auto — penetrácia, epoxid v dvoch vrstvách, protišmykový presyp + náradie.",
  },
  {
    id: "sada-byt-80",
    name: "Sada: Byt 80 m² — liata podlaha Marble FX",
    systemId: "marble-fx",
    areaM2: 80,
    reservePct: 5,
    thicknessMm: 4,
    image: "/images/hero/byvanie-v2.webp",
    description:
      "Kompletný materiál na dizajnovú liatu podlahu do bytu — nivelačka 4 mm, medzivrstva, stierka 3000FX v jednom odtieni a matný lak + náradie.",
  },
];
