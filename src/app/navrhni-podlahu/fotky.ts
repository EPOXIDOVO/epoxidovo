import { TOPSTONE_METALIK } from "@/content/topstone-metalik";

/**
 * Fotky pre náhľadový panel konfigurátora.
 *
 * Kde reálnu fotku nemáme (steny, mikrocement, časť priestorov), vraciame
 * null — UI zobrazí šedý placeholder s popisom, čo tam patrí. Zoznam
 * chýbajúcich fotiek je v súhrne na konci implementácie.
 */

export type Nahlad = { src: string | null; label: string; chyba?: string };

const F = (src: string, label: string): Nahlad => ({ src, label });
const CHYBA = (label: string, chyba: string): Nahlad => ({ src: null, label, chyba });

export const FOTO_CO: Record<string, Nahlad> = {
  podlaha: F("/images/categories/jednofarebne.jpg", "Liata podlaha"),
  stena: CHYBA("Stena", "Fotka hotovej mikrocementovej steny"),
  schody: F("/images/realizacie/r-17.jpg", "Schodisko"),
};

export const FOTO_PRIESTOR: Record<string, Nahlad> = {
  byt_dom: F("/images/hero/byvanie-v2.webp", "Bývanie"),
  garaz: F("/images/hero/garaz.webp", "Garáž"),
  priemysel: F("/images/realizacie/r-20.jpg", "Priemysel"),
  ine: CHYBA("Iné", "Priestor, ktorý zákazník opíše sám"),
  hala: F("/images/realizacie/r-20.jpg", "Hala, sklad"),
  dielna: F("/images/realizacie/r-48.jpg", "Dielňa"),
  predajna: F("/images/hero/byvanie-kitchen.jpg", "Predajňa, kancelária"),
  pivnica: CHYBA("Pivnica, technická miestnosť", "Fotka podlahy v pivnici / technickej miestnosti"),
  telocvicna: CHYBA("Telocvičňa", "Fotka športovej podlahy"),
  terasa: CHYBA("Terasa, balkón", "Fotka vonkajšej terasy s protišmykovým povrchom"),
  vonkajsia_garaz: CHYBA("Vonkajšia garáž, prístrešok", "Fotka prístrešku / vonkajšieho státia"),
  rampa: CHYBA("Rampa, nájazd", "Fotka rampy s protišmykom"),
  bazen: CHYBA("Bazénové okolie", "Fotka okolia bazéna"),
  kupelna: CHYBA("Kúpeľňa", "Fotka mikrocementovej kúpeľne"),
  obyvacka: CHYBA("Obývačka, spálňa", "Fotka dekoratívnej steny v interiéri"),
  kuchyna: CHYBA("Kuchyňa", "Fotka stenového obkladu v kuchyni"),
  prevadzka: CHYBA("Prevádzka, predajňa", "Fotka umývateľnej steny v prevádzke"),
  priemyselna_stena: CHYBA("Priemyselná stena, sokel", "Fotka priemyselného sokla"),
  fasada: CHYBA("Fasáda", "Fotka fasádneho náteru"),
  sokel: CHYBA("Sokel", "Fotka vonkajšieho sokla"),
  oporny_mur: CHYBA("Oporný múr", "Fotka oporného múru"),
};

export const FOTO_VZHLAD: Record<string, Nahlad> = {
  jednofarebna: F("/images/hero/byvanie-v2.webp", "Jednofarebné"),
  chipsy: F("/images/categories/chipsove.jpg", "Chipsové"),
  metalik: F("/images/categories/metalicke.jpg", "Metalické"),
  marble: F("/images/categories/mramorove.jpg", "Mramorové"),
  priemyselna: F("/images/hero/hala.jpg", "Priemyselné"),
  beton_look: F("/images/vzorkovnik/arturo/concrete-look-downtown-mix.webp", "Betón Look — Downtown Mix"),
  kamenny_koberec: CHYBA("Kamenný koberec", "Fotka kamenného koberca"),
  mikrocement: CHYBA("Mikrocement", "Fotka mikrocementovej steny"),
  epoxidovy_nater: CHYBA("Epoxidový náter na stenu", "Fotka natretej steny v prevádzke"),
  dekor: CHYBA("Dekoratívny efekt", "Fotka dekoratívnej stierky na stene"),
};

/**
 * Dve doplnkové fotky pod každou kartou vzhľadu (stĺpec ako na webe).
 * null = prázdne miesto, UI ukáže čakajúci rámik. Sem doplň reálne fotky.
 */
export const GALERIA_VZHLAD: Record<string, (string | null)[]> = {
  // rovnaké varianty ako v sekcii „Čo všetko vieme vyčarovať" na webe
  jednofarebna: ["/images/realizacie/r-37.webp", "/images/realizacie/r-10.jpg"],
  chipsy: ["/images/realizacie/r-47.jpg", "/images/realizacie/r-49.jpg"],
  metalik: [
    "/images/eshop/topstone-metallic/azuro.jpg",
    "/images/eshop/topstone-metallic/gold.jpg",
  ],
  marble: [null, null],
  beton_look: ["/images/vzorkovnik/arturo/concrete-look-raw-basalt.webp", "/images/vzorkovnik/arturo/concrete-look-rough-lead.webp"],
  priemyselna: ["/images/realizacie/r-20.jpg", "/images/realizacie/r-22.jpg"],
};

/** Metalické a marble efekty — reálne vzorky TopStone. */
export const EFEKTY = TOPSTONE_METALIK;

/** Základná trieda RAL — bežná cena a skladom. Ostatné = pastelová trieda. */
export const RAL_ZAKLADNE = ["RAL 7032", "RAL 7035"];
