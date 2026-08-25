import type { FotkaPodlahy } from "@/content/typ-podlahy";
import { CATEGORIES } from "@/content/categories";

/**
 * JEDEN zdroj pravdy pre typy podláh, ktoré vieme vyčarovať.
 *
 * Používa to sekcia „Čo všetko vieme vyčarovať" na homepage, náhľad fotky
 * aj prvý krok konfigurátora cenovej ponuky — user 2026-08-24: „make sure
 * ze ta uvodna fotka je vzdy ta co je na tom nahlade aj v co vsetko vieme
 * vycarovat". Keď sa fotka alebo cena zmení tu, zmení sa všade naraz.
 *
 * `crmFloorType` mapuje typ na kľúč, ktorý pozná generátor CP v NajCRM
 * (webhook /api/webhook/landing-cp). null = CRM tento typ nepozná, takže
 * automatická cena sa nepočíta a dopyt ide obchodníkovi ako bežný lead.
 */

export type CrmFloorType = "jednofarebna" | "chipsova" | "mramorova" | "metalicka";

export type TypPodlahyKarta = {
  slug: string;
  /** Názov na karte aj v konfigurátore. */
  name: string;
  /** €/m² od. 0 = cena na dopyt. */
  priceFrom: number;
  priceLabel?: string;
  /** Úvodná (titulná) fotka — rovnaká na karte, v náhľade aj v konfigurátore. */
  image: string;
  href?: string;
  /** Fotky iných farieb toho istého typu — otvárajú náhľad. */
  variants: FotkaPodlahy[];
  /** Nemáme ešte vlastné realizačné fotky → v náhľade je „Čoskoro". */
  pripravujeme?: boolean;
  /** Kľúč typu v generátore CP (NajCRM). null = bez automatickej ceny. */
  crmFloorType: CrmFloorType | null;
  /**
   * Kódy systémov z NajCRM, ktoré pri tomto type ponúkame na výber
   * (napr. epoxid vs polyuretán). Keď to nevyplníš, konfigurátor si vezme
   * default systém pre daný typ z /admin/systems — takže nový typ podlahy
   * stačí pridať sem a funguje aj v cenovej ponuke.
   */
  crmSystemy?: string[];
};

const kat = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export const TYPY_PODLAH: TypPodlahyKarta[] = [
  {
    slug: "jednofarebne",
    name: "Hladké jednofarebné",
    priceFrom: kat("jednofarebne")?.priceFrom ?? 59,
    image: "/images/hero/byvanie-v2.webp",
    href: "/realizacie?kategoria=jednofarebne",
    crmFloorType: "jednofarebna",
    // user 2026-08-25: pri jednofarebných na výber epoxid aj polyuretán
    crmSystemy: ["264", "3000"],
    variants: [
      // bývanie, nie priemysel — pod kartou „Jednofarebné" majú byť interiéry
      { src: "/images/realizacie/r-37.webp", typ: "jednofarebna", alt: "Jednofarebná podlaha — biela obývačka s krbom", farba: "RAL 9010", farbaLabel: "Biela" },
      { src: "/images/realizacie/r-10.jpg", typ: "jednofarebna", alt: "Jednofarebná podlaha — lesklá kuchyňa", farba: "RAL 9016", farbaLabel: "Dopravná biela" },
      { src: "/images/realizacie/r-13.jpg", typ: "jednofarebna", alt: "Jednofarebná podlaha — svetlá kúpeľňa", farba: "RAL 7047", farbaLabel: "Svetlosivá" },
    ],
  },
  {
    slug: "chipsove",
    name: kat("chipsove")?.name ?? "Chipsové",
    priceFrom: kat("chipsove")?.priceFrom ?? 49,
    image: "/images/categories/chipsove.jpg",
    href: "/realizacie?kategoria=chipsove",
    crmFloorType: "chipsova",
    variants: [
      { src: "/images/realizacie/r-47.jpg", typ: "chipsova", alt: "Chipsová podlaha — biela s čiernymi chipsami, chodba skladu", farba: "Snow pearl", farbaLabel: "Biela s čiernymi chipsami" },
      { src: "/images/realizacie/r-49.jpg", typ: "chipsova", alt: "Chipsová podlaha — sivá s čierno-bielymi chipsami", farba: "Granit klasik", farbaLabel: "Sivá s čierno-bielymi chipsami" },
      { src: "/images/realizacie/r-48.jpg", typ: "chipsova", alt: "Chipsová podlaha — svetlá lesklá s čierno-bielymi chipsami", farba: "Snow pearl", farbaLabel: "Svetlá lesklá s chipsami" },
    ],
  },
  {
    slug: "metalicke",
    name: kat("metalicke")?.name ?? "Metalické",
    priceFrom: kat("metalicke")?.priceFrom ?? 129,
    image: "/images/categories/metalicke.jpg",
    href: "/realizacie?kategoria=metalicke",
    crmFloorType: "metalicka",
    variants: [
      { src: "/images/eshop/topstone-metallic/azuro.jpg", typ: "metalicka", alt: "Metalická podlaha — Azuro modrá", farba: "Azuro", farbaLabel: "Azuro modrá" },
      { src: "/images/eshop/topstone-metallic/gold.jpg", typ: "metalicka", alt: "Metalická podlaha — Gold zlatá", farba: "Gold", farbaLabel: "Gold zlatá" },
      { src: "/images/eshop/topstone-metallic/moose-green.jpg", typ: "metalicka", alt: "Metalická podlaha — Moose green zelená", farba: "Moose Green", farbaLabel: "Moose green zelená" },
    ],
  },
  {
    slug: "mramorove",
    name: "Mramorové",
    priceFrom: 149,
    image: "/images/categories/mramorove.jpg",
    href: "/realizacie?kategoria=mramorove",
    crmFloorType: "mramorova",
    pripravujeme: true,
    variants: [],
  },
  {
    slug: "beton-look",
    name: "Betón look",
    priceFrom: 79,
    image: "/images/vzorkovnik/arturo/concrete-look-downtown-mix.webp",
    href: "/vzorkovnik?typ=arturo",
    // generátor CP v NajCRM betón look nepozná → dopyt ide obchodníkovi
    crmFloorType: null,
    pripravujeme: true,
    variants: [],
  },
  {
    // priemyselné na konci — B2C zákazník ich hľadá najmenej
    slug: "priemyselne",
    name: kat("priemyselne")?.name ?? "Priemyselné",
    priceFrom: kat("priemyselne")?.priceFrom ?? 0,
    priceLabel: kat("priemyselne")?.priceLabel ?? "Cena na dopyt",
    image: "/images/hero/hala.jpg",
    href: "/realizacie?priestor=hala-firma",
    // priemyselné sa cenia individuálne podľa prevádzky, nie paušálom
    crmFloorType: null,
    variants: [
      { src: "/images/realizacie/r-20.jpg", typ: "priemyselna", alt: "Priemyselná podlaha — modrá hala", farba: "RAL 5012", farbaLabel: "Svetlomodrá" },
      { src: "/images/realizacie/r-22.jpg", typ: "priemyselna", alt: "Priemyselná podlaha — zelená hala", farba: "RAL 6021", farbaLabel: "Bledozelená" },
      { src: "/images/realizacie/r-46.jpg", typ: "priemyselna", alt: "Priemyselná podlaha — béžová hala", farba: "RAL 1001", farbaLabel: "Béžová" },
    ],
  },
];

export const getTypPodlahy = (slug: string) =>
  TYPY_PODLAH.find((t) => t.slug === slug) ?? null;
