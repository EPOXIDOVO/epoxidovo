/**
 * Rozhodovacia logika konfigurátora — čisté funkcie bez UI.
 *
 * TU sa upravujú technické pravidlá. Každé pravidlo má svoju pomenovanú
 * funkciu a komentár s dôvodom, aby sa dalo zmeniť bez zásahu do
 * komponentov. Poradie otázok a vzhľad rieši KonfiguratorClient.tsx,
 * skladby systémov `systemy.ts`.
 */

import { PRODUKT, SYSTEMY, type Co, type Kde, type System, type Vrstva } from "./systemy";

export type Stav = "rovny" | "mierne" | "vyrazne";
export type Priznak = "praskliny" | "vlhkost" | "mastne";

export type Volba = {
  co: Co | null;
  kde: Kde | null;
  priestor: string | null;
  /** Voľný popis, keď zákazník zvolí „Iné". */
  priestorPopis: string | null;
  podklad: string | null;
  stav: Stav | null;
  priznaky: Priznak[];
  plochaM2: number | null;
  /** schody — počet stupňov a šírka v cm (plocha sa dopočíta) */
  pocetStupnov: number | null;
  sirkaSchodovCm: number | null;
  vzhlad: string | null;
  odtien: string | null;
  povrch: "mat" | "lesk";
  protismyk: boolean;
  /** Rezerva na strihy a dorovnanie — fixných 10 %, zákazník ju nenastavuje. */
  rezervaPercent: number;
  hrubkaNivelacieMm: number;
  pocetPrasklin: number;
};

export const PREDVOLENA_VOLBA: Volba = {
  // podlaha je predvolená — prvý krok ponúka rovno podlahové vzhľady
  co: "podlaha",
  kde: null,
  priestor: null,
  priestorPopis: null,
  podklad: null,
  stav: null,
  priznaky: [],
  plochaM2: null,
  pocetStupnov: null,
  sirkaSchodovCm: null,
  vzhlad: null,
  odtien: null,
  povrch: "mat",
  protismyk: false,
  rezervaPercent: 10,
  hrubkaNivelacieMm: 4,
  pocetPrasklin: 1,
};

/** Minimálna hrúbka nivelácie — pod ňou materiál degraduje a praská. */
export const MIN_NIVELACIA_MM = 4;
export const MAX_NIVELACIA_MM = 10;
/** Cena služby zošívania jednej praskliny. */
export const CENA_ZOSIVANIE_EUR = 20;

/* ── Katalógy volieb ─────────────────────────────────────────────── */

export const PRIESTORY: Record<string, { id: string; label: string }[]> = {
  "podlaha-interier": [
    { id: "byt_dom", label: "Bývanie" },
    { id: "garaz", label: "Garáž" },
    { id: "priemysel", label: "Priemysel" },
    { id: "ine", label: "Iné" },
  ],
  "podlaha-exterier": [
    { id: "terasa", label: "Terasa, balkón" },
    { id: "vonkajsia_garaz", label: "Vonkajšia garáž, prístrešok" },
    { id: "rampa", label: "Rampa, nájazd" },
    { id: "ine", label: "Iné" },
  ],
  "stena-interier": [
    { id: "kupelna", label: "Kúpeľňa" },
    { id: "obyvacka", label: "Obývačka, spálňa" },
    { id: "kuchyna", label: "Kuchyňa" },
    { id: "prevadzka", label: "Prevádzka, predajňa" },
    { id: "priemyselna_stena", label: "Priemyselná stena, sokel" },
  ],
  "stena-exterier": [
    { id: "fasada", label: "Fasáda" },
    { id: "sokel", label: "Sokel" },
    { id: "oporny_mur", label: "Oporný múr" },
  ],
};

const PODKLADY_VSETKY = [
  { id: "beton", label: "Betón" },
  { id: "cem_poter", label: "Cementový poter" },
  { id: "anhydrit", label: "Anhydritový poter" },
  { id: "dlazba", label: "Existujúca keramická dlažba" },
  { id: "sadrokarton", label: "Sadrokartón / omietka" },
  { id: "stary_nater", label: "Staré nátery" },
  { id: "neviem", label: "Neviem" },
];

/** Pravidlo: sadrokartón len pri stene, anhydrit len pri podlahe. */
export function dostupnePodklady(co: Co | null) {
  return PODKLADY_VSETKY.filter((p) => {
    if (p.id === "sadrokarton") return co === "stena";
    if (p.id === "anhydrit") return co === "podlaha" || co === "schody";
    return true;
  });
}

/** Názvy sedia s kategóriami na webe — zákazník hľadá to isté slovo. */
export const VZHLADY_PODLAHA = [
  { id: "metalik", label: "Metalické" },
  { id: "marble", label: "Mramorové" },
  { id: "beton_look", label: "Betón Look" },
  { id: "jednofarebna", label: "Jednofarebné" },
  { id: "chipsy", label: "Chipsové" },
  { id: "priemyselna", label: "Priemyselné" },
  { id: "kamenny_koberec", label: "Kamenný koberec" },
];

export const VZHLADY_STENA = [
  { id: "mikrocement", label: "Mikrocement" },
  { id: "epoxidovy_nater", label: "Epoxidový náter (jednofarebný)" },
  { id: "dekor", label: "Dekoratívny efekt" },
];

/* ── Tvrdé zákazy ────────────────────────────────────────────────── */

/** Produkty na epoxidovej báze — v exteriéri žltnú a kriedovatejú (pravidlo 1). */
const EPOXIDOVE_SKU = new Set<string>([
  PRODUKT.sf264.sku,
  PRODUKT.primer03.sku,
  "SF-2510W",
]);

export function jeEpoxidovy(system: System): boolean {
  return system.vrstvy.some((v) => EPOXIDOVE_SKU.has(v.produktSku));
}

/**
 * Pravidlo 6: drevo/OSB konfigurátor nevie vyriešiť — treba obhliadku.
 * Vracia dôvod, prečo sa výsledok nedá zobraziť (alebo null).
 */
export function blokujePodklad(volba: Volba): string | null {
  if (volba.podklad === "drevo") {
    return "Drevo a OSB sa hýbu a pracujú s vlhkosťou — skladbu treba navrhnúť podľa konkrétnej konštrukcie. Toto potrebuje obhliadku.";
  }
  return null;
}

/**
 * Dostupnosť vzhľadov. Nedostupné NEMIZNÚ — vraciame ich s dôvodom,
 * UI ich zošedne a ukáže tooltip (pravidlá 3, 5, 9).
 */
export function dostupnostVzhladov(volba: Volba): {
  id: string;
  label: string;
  dostupny: boolean;
  dovod?: string;
}[] {
  const zoznam = volba.co === "stena" ? VZHLADY_STENA : VZHLADY_PODLAHA;
  return zoznam.map((vz) => {
    // 3 — metalik a marble nie sú možné v exteriéri ani na schodoch
    if ((vz.id === "metalik" || vz.id === "marble") && volba.kde === "exterier") {
      return { ...vz, dostupny: false, dovod: "V exteriéri nie — UV žiarenie efekt zničí a povrch by bol klzký." };
    }
    if ((vz.id === "metalik" || vz.id === "marble") && volba.co === "schody") {
      return { ...vz, dostupny: false, dovod: "Na schodoch nie — potrebujú protišmykový povrch, efekt by sa zaliaty stratil." };
    }
    // 5 — v garáži neponúkaj metalik (pneumatiky, mechanická záťaž)
    if (vz.id === "metalik" && volba.priestor === "garaz") {
      return { ...vz, dostupny: false, dovod: "Do garáže neodporúčame — pneumatiky a bodové zaťaženie efekt poškodia." };
    }
    // 3b — dekoratívny betón look je interiérový, vonku nevydrží mráz
    if (vz.id === "beton_look" && volba.kde === "exterier") {
      return { ...vz, dostupny: false, dovod: "Betón look je do interiéru — vonku ho mráz a vlhkosť rozrušia." };
    }
    // 9 — mikrocement na podlahu v exteriéri nie
    if (vz.id === "mikrocement" && volba.kde === "exterier") {
      return { ...vz, dostupny: false, dovod: "V exteriéri mikrocement neponúkame — nezvláda mráz a stálu vlhkosť." };
    }
    // 15 — na sadrokartóne len mikrocement alebo náter, žiadne liate systémy
    if (
      volba.podklad === "sadrokarton" &&
      !["mikrocement", "epoxidovy_nater"].includes(vz.id)
    ) {
      return { ...vz, dostupny: false, dovod: "Na sadrokartóne len mikrocement alebo náter — liata vrstva je preň príliš ťažká." };
    }
    return { ...vz, dostupny: true };
  });
}

/**
 * Opačný smer pravidiel 3 a 3b — vzhľad sa vyberá ako prvý, takže ďalšie
 * kroky treba obmedziť podľa neho. Vracia dôvod, ak sa možnosť nedá zvoliť.
 */
export function dostupnostKde(volba: Volba): {
  id: Kde;
  dostupny: boolean;
  dovod?: string;
}[] {
  const lenInterier = ["metalik", "marble", "beton_look", "mikrocement"];
  return (["interier", "exterier"] as Kde[]).map((id) => {
    if (id === "exterier" && volba.vzhlad && lenInterier.includes(volba.vzhlad)) {
      return {
        id,
        dostupny: false,
        dovod: "Tento vzhľad je iba do interiéru — vonku ho zničí UV a mráz.",
      };
    }
    return { id, dostupny: true };
  });
}

/** Priestory, ktoré sa k zvolenému vzhľadu hodia (pravidlo 5 naopak). */
export function nevhodnyPriestor(volba: Volba, priestor: string): string | null {
  if (volba.vzhlad === "metalik" && priestor === "garaz") {
    return "Metalický efekt do garáže neodporúčame — pneumatiky a bodové zaťaženie ho poškodia.";
  }
  return null;
}

/**
 * Systémy, ktoré vyhovujú voľbe. Aplikuje pravidlá 1 (exteriér = nikdy
 * epoxid) a 4 (byt/dom = vždy polyuretán).
 */
export function dostupneSystemy(volba: Volba): System[] {
  return SYSTEMY.filter((s) => {
    if (volba.co && !s.podmienky.co.includes(volba.co)) return false;
    if (volba.kde && !s.podmienky.kde.includes(volba.kde)) return false;
    if (volba.priestor && s.podmienky.priestor.length && !s.podmienky.priestor.includes(volba.priestor)) return false;
    if (volba.podklad && s.podmienky.podklad.length && !s.podmienky.podklad.includes(volba.podklad)) return false;
    if (volba.vzhlad && !s.podmienky.vzhlad.includes(volba.vzhlad)) return false;
    // 1 — exteriér vždy polyuretán, nikdy epoxid
    if (volba.kde === "exterier" && jeEpoxidovy(s)) return false;
    // 4 — byt/dom vždy polyuretán (nemiešať epoxid a PU v byte)
    if (volba.priestor === "byt_dom" && jeEpoxidovy(s)) return false;
    return true;
  });
}

/** Pravidlo 2 + protišmyk na schodoch — vynútený, needitovateľný. */
export function protismykVynuteny(volba: Volba): boolean {
  return volba.kde === "exterier" || volba.co === "schody";
}

export type Varovanie = {
  typ: "info" | "vystraha" | "blokujuce";
  nadpis: string;
  text: string;
  cta?: { label: string; href: string };
};

/** Pravidlá 7, 8, 14 — varovania, ktoré idú k výsledku. */
export function varovania(volba: Volba): Varovanie[] {
  const out: Varovanie[] = [];
  if (volba.podklad === "dlazba") {
    out.push({
      typ: "vystraha",
      nadpis: "Existujúca dlažba — nutná obhliadka",
      text: "Na keramickú dlažbu sa dá liať, ale len po obhliadke (súdržnosť, dutiny, škáry) a s podpísaným vylúčením záruky na prídržnosť.",
      cta: { label: "Objednať obhliadku", href: "/cenova-ponuka" },
    });
  }
  if (volba.priznaky.includes("vlhkost")) {
    out.push({
      typ: "blokujuce",
      nadpis: "Podozrenie na vlhkosť — pred objednávkou meranie",
      text: "Podklad si najprv odmeraj vlhkomerom. Podľa použitého materiálu musí byť zvyšková vlhkosť pod 4 až 6 % — ak je v podklade vzlínajúca vlhkosť, para nemá kadiaľ uniknúť a podlaha sa po čase odtrhne od podkladu aj s kusmi betónu. Merací prístroj ti požičiame alebo prídeme odmerať.",
      cta: { label: "Pozrieť vlhkomery", href: "/eshop?kat=vlhkomery#katalog" },
    });
  }
  if (volba.podklad === "anhydrit") {
    out.push({
      typ: "info",
      nadpis: "Anhydrit — prebrúsenie šlemu povinné",
      text: "Anhydritový poter treba prebrúsiť (odstrániť šlem) a povysávať. Vlhkosť max 0,5 % CM.",
    });
  }
  if (volba.stav === "vyrazne") {
    out.push({
      typ: "vystraha",
      nadpis: "Výrazne nerovný podklad — najprv prebrúsiť",
      text: "Pri väčších nerovnostiach a spádoch nestačí naliať niveláciu na to, čo tam je. Plochu treba najprv prebrúsiť diamantovou brúskou (zrezať hrbole, otvoriť póry, odstrániť cementové mlieko), povysávať a až potom penetrovať. Bez toho sa nivelácia uchytí nerovnomerne a v tenkých miestach popraská.",
      cta: { label: "Pozrieť brúsky", href: "/eshop?kat=brusky#katalog" },
    });
  }
  if (volba.stav === "mierne") {
    out.push({
      typ: "info",
      nadpis: "Mierne nerovný podklad — počítaj s niveláciou",
      text: "Drobné vlny a prechody liata vrstva neschová, naopak ich zvýrazní. Niveláciu sme ti do skladby pridali — vo výsledku si ju vieš odškrtnúť, ak si podkladom istý.",
      cta: { label: "Nivelácie a potery", href: "/eshop?kat=nivelacie#katalog" },
    });
  }
  if (volba.priznaky.includes("praskliny")) {
    out.push({
      typ: "info",
      nadpis: "Praskliny — zošiť pred liatím",
      text: "Prasklinu treba rozrezať do V, vyčistiť, priečne vložiť sponky a zaliať opravnou maltou. Ak sa preskočí, prasklina si cestu cez novú vrstvu nájde do pár mesiacov.",
      cta: { label: "Materiál na opravy betónu", href: "/eshop?kat=potery#katalog" },
    });
  }
  if (volba.priznaky.includes("mastne")) {
    out.push({
      typ: "info",
      nadpis: "Mastné škvrny — treba prebrúsiť",
      text: "Olej a mastnota bránia prídržnosti — živica sa na ne nechytí. Pred aplikáciou treba prebrúsiť celý povrch, nielen škvrny, aby bola plocha rovnomerne otvorená a nasiakavá. Brúsi sa diamantovou brúskou s odsávaním.",
      cta: { label: "Pozrieť brúsky", href: "/eshop?kat=brusky#katalog" },
    });
  }
  return out;
}

/* ── Automatické doplnenia do skladby ────────────────────────────── */

export function trebaNivelaciu(volba: Volba): boolean {
  // 10 — nerovný podklad
  return volba.stav === "mierne" || volba.stav === "vyrazne";
}

export type SkladbaPolozka = Vrstva & {
  /** vrstva pridaná pravidlom, nie systémom */
  auto?: boolean;
  /** prípravný krok bez materiálu (brúsenie, vysávanie) */
  bezMaterialu?: boolean;
  /** kg/m²/mm — len pri nivelácii, spotreba závisí od hrúbky */
  naMm?: boolean;
};

/**
 * Postaví finálnu skladbu: prípravné kroky + prípadná nivelácia
 * a medzivrstva (pravidlá 10, 11) + vrstvy systému + protišmyk (2).
 */
export function postavSkladbu(volba: Volba, system: System): SkladbaPolozka[] {
  const out: SkladbaPolozka[] = [];
  let poradie = 1;
  const pridaj = (v: Omit<SkladbaPolozka, "poradie">) => out.push({ ...v, poradie: poradie++ });

  pridaj({
    nazov: "Príprava podkladu",
    produktSku: "",
    produktNazov: "Brúsenie a dôkladné vysatie",
    spotrebaKgM2: null,
    velkostBaleniaKg: 0,
    bezMaterialu: true,
    prestavkaHodiny: 0,
    poznamka:
      volba.podklad === "anhydrit"
        ? "Vrátane prebrúsenia šlemu (anhydrit)"
        : undefined,
  });

  if (volba.priznaky.includes("mastne")) {
    pridaj({
      nazov: "Odmastenie / frézovanie",
      produktSku: "",
      produktNazov: "Odstránenie mastných škvŕn",
      spotrebaKgM2: null,
      velkostBaleniaKg: 0,
      bezMaterialu: true,
      auto: true,
      poznamka: "Rozsah upresníme pri obhliadke",
    });
  }

  if (trebaNivelaciu(volba)) {
    // 10 — 01 Primer + Level-30
    pridaj({
      nazov: "Penetrácia pod niveláciu",
      produktSku: PRODUKT.primer01.sku,
      produktNazov: PRODUKT.primer01.nazov,
      spotrebaKgM2: PRODUKT.primer01.spotreba,
      velkostBaleniaKg: PRODUKT.primer01.balenie,
      prestavkaHodiny: 12,
      auto: true,
    });
    pridaj({
      nazov: `Nivelácia ${volba.hrubkaNivelacieMm} mm`,
      produktSku: PRODUKT.level30.sku,
      produktNazov: PRODUKT.level30.nazov,
      spotrebaKgM2: PRODUKT.level30.spotreba,
      velkostBaleniaKg: PRODUKT.level30.balenie,
      prestavkaHodiny: 24,
      auto: true,
      naMm: true,
      poznamka: `Minimálna hrúbka ${MIN_NIVELACIA_MM} mm — pri menšej materiál degraduje a praská`,
    });
    // 11 — po nivelácii prebrúsiť a medzivrstva 150 Plus (NIKDY 03 Primer)
    pridaj({
      nazov: "Prebrúsenie nivelácie",
      produktSku: "",
      produktNazov: "Prebrúsiť a povysávať niveláciu",
      spotrebaKgM2: null,
      velkostBaleniaKg: 0,
      bezMaterialu: true,
      auto: true,
    });
    pridaj({
      nazov: "Medzivrstva",
      produktSku: PRODUKT.sf150plus.sku,
      produktNazov: PRODUKT.sf150plus.nazov,
      spotrebaKgM2: PRODUKT.sf150plus.spotreba,
      velkostBaleniaKg: PRODUKT.sf150plus.balenie,
      prestavkaHodiny: 12,
      auto: true,
      poznamka: "Po nivelácii vždy 150 Plus, nikdy 03 Primer",
    });
  }

  for (const v of system.vrstvy) {
    // penetráciu systému preskoč, ak už bola nivelácia + medzivrstva
    if (trebaNivelaciu(volba) && v.nazov === "Penetrácia") continue;
    pridaj({ ...v });
  }

  // 2 — protišmykový posyp (ak ho systém ešte nemá)
  const uzMaPosyp = out.some((v) => v.produktSku === PRODUKT.piesok.sku);
  if ((protismykVynuteny(volba) || volba.protismyk) && !uzMaPosyp) {
    pridaj({
      nazov: "Protišmykový posyp",
      produktSku: PRODUKT.piesok.sku,
      produktNazov: PRODUKT.piesok.nazov,
      spotrebaKgM2: PRODUKT.piesok.spotreba,
      velkostBaleniaKg: PRODUKT.piesok.balenie,
      prestavkaHodiny: 12,
      auto: true,
      poznamka: protismykVynuteny(volba)
        ? volba.co === "schody"
          ? "Na schodoch povinný"
          : "V exteriéri povinný"
        : undefined,
    });
  }

  return out;
}
