"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CATEGORIES } from "@/content/categories";
import type { FotkaPodlahy } from "@/content/typ-podlahy";
import { NahladPodlahyProvider, useNahladPodlahy } from "./NahladPodlahy";

/**
 * Sekcia "Čo všetko vieme vyčarovať" — z briefu klienta:
 * - Oranžovo-hnedé pozadie (#B0511D)
 * - Nadpis: "Epoxidové a Polyuretanové podlahy, ktoré..." s modrým highlightom
 *   na "Epoxidové a Polyuretanové"
 * - VYMAZANÝ pravý paragraph "Prinášame originálne epoxidové podlahy..."
 *   (z briefu klienta — preč)
 * - Pridaná šípka + text "klikni a Inšpiruj sa realizáciami" + CTA "Ukážky podláh"
 *   (otvára SamplePicker modal s 3 typmi priestoru)
 * - 4 karty (#5C2C18 → hover #3db6e8 cez 700ms)
 * - Poradie kariet z briefu: Jednofarebné → Chipsové → Mramorové → Metalické
 */

// Farebné varianty pod hlavnou kartou — 3 fotky iných farieb toho istého
// typu podlahy. Vlastné realizácie + oficiálne TopStone vzory (metalické).
const VARIANT_PHOTOS: Record<string, FotkaPodlahy[]> = {
  jednofarebne: [
    // bývanie, nie priemysel — pod kartou „Jednofarebné" majú byť interiéry
    { src: "/images/realizacie/r-37.webp", typ: "jednofarebna", alt: "Jednofarebná podlaha — biela obývačka s krbom", farba: "RAL 9010", farbaLabel: "Biela" },
    { src: "/images/realizacie/r-10.jpg", typ: "jednofarebna", alt: "Jednofarebná podlaha — lesklá kuchyňa", farba: "RAL 9016", farbaLabel: "Dopravná biela" },
    { src: "/images/realizacie/r-13.jpg", typ: "jednofarebna", alt: "Jednofarebná podlaha — svetlá kúpeľňa", farba: "RAL 7047", farbaLabel: "Svetlosivá" },
  ],
  chipsove: [
    { src: "/images/realizacie/r-47.jpg", typ: "chipsova", alt: "Chipsová podlaha — krémová", farbaLabel: "Krémová" },
    { src: "/images/realizacie/r-49.jpg", typ: "chipsova", alt: "Chipsová podlaha — sivá", farbaLabel: "Sivá" },
    { src: "/images/realizacie/r-48.jpg", typ: "chipsova", alt: "Chipsová podlaha — svetlosivá lesklá", farbaLabel: "Svetlosivá lesklá" },
  ],
  metalicke: [
    { src: "/images/eshop/topstone-metallic/azuro.jpg", typ: "metalicka", alt: "Metalická podlaha — Azuro modrá", farba: "Azuro", farbaLabel: "Azuro modrá" },
    { src: "/images/eshop/topstone-metallic/gold.jpg", typ: "metalicka", alt: "Metalická podlaha — Gold zlatá", farba: "Gold", farbaLabel: "Gold zlatá" },
    { src: "/images/eshop/topstone-metallic/moose-green.jpg", typ: "metalicka", alt: "Metalická podlaha — Moose green zelená", farba: "Moose Green", farbaLabel: "Moose green zelená" },
  ],
  priemyselne: [
    { src: "/images/realizacie/r-20.jpg", typ: "priemyselna", alt: "Priemyselná podlaha — modrá hala", farba: "RAL 5012", farbaLabel: "Svetlomodrá" },
    { src: "/images/realizacie/r-22.jpg", typ: "priemyselna", alt: "Priemyselná podlaha — zelená hala", farba: "RAL 6021", farbaLabel: "Bledozelená" },
    { src: "/images/realizacie/r-46.jpg", typ: "priemyselna", alt: "Priemyselná podlaha — béžová hala", farba: "RAL 1001", farbaLabel: "Béžová" },
  ],
};

// Kocka so 1-5 bodkami — biely zaoblený štvorček s tmavými bodkami
function DiceIcon({ pips }: { pips: 1 | 2 | 3 | 4 | 5 }) {
  const positions: Record<number, [number, number][]> = {
    1: [[2.5, 2.5]],
    2: [[1.5, 1.5], [3.5, 3.5]],
    3: [[1.5, 1.5], [2.5, 2.5], [3.5, 3.5]],
    4: [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]],
    5: [[1.5, 1.5], [3.5, 1.5], [2.5, 2.5], [1.5, 3.5], [3.5, 3.5]],
  };
  return (
    <svg
      viewBox="0 0 5 5"
      className="w-full h-full"
      fill="currentColor"
      aria-hidden
    >
      {positions[pips].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={0.42} />
      ))}
    </svg>
  );
}

/** Obal s providerom — sekcia sa používa na viacerých stránkach, nech
 *  nemusí každá z nich vedieť o náhľade. */
/**
 * Stĺpce showcase — 4 živé kategórie z CATEGORIES + 2 pripravované
 * (mramorové, betón look). Tie dve zámerne NIE sú v globálnych
 * CATEGORIES, aby nevznikli prázdne /sluzby/… stránky a sitemap.
 */
type ShowcaseCat = {
  slug: string;
  name: string;
  priceFrom: number;
  priceLabel?: string;
  /** Hlavná fotka; bez nej stĺpec ukazuje „Čoskoro". */
  image?: string;
  href?: string;
  pripravujeme?: boolean;
};

const SHOWCASE_CATS: ShowcaseCat[] = [
  ...CATEGORIES.filter((c) => c.slug !== "priemyselne").map((c) => ({
    slug: c.slug,
    name: c.slug === "jednofarebne" ? "Hladké jednofarebné" : c.name,
    priceFrom: c.priceFrom,
    priceLabel: c.priceLabel,
    image:
      c.slug === "jednofarebne"
        ? "/images/hero/byvanie-v2.webp"
        : c.slug === "priemyselne"
          ? "/images/hero/hala.jpg"
          : `/images/categories/${c.slug}.jpg`,
    href: c.slug === "priemyselne" ? "/realizacie?priestor=hala-firma" : `/realizacie?kategoria=${c.slug}`,
  })),
  {
    slug: "mramorove",
    name: "Mramorové",
    priceFrom: 149,
    image: "/images/categories/mramorove.jpg",
    href: "/realizacie?kategoria=mramorove",
    pripravujeme: true,
  },
  {
    slug: "beton-look",
    name: "Betón look",
    priceFrom: 79,
    image: "/images/vzorkovnik/arturo/concrete-look-downtown-mix.webp",
    href: "/vzorkovnik?typ=arturo",
    pripravujeme: true,
  },
  // priemyselné na konci — B2C zákazník ich hľadá najmenej
  ...CATEGORIES.filter((c) => c.slug === "priemyselne").map((c) => ({
    slug: c.slug,
    name: c.name,
    priceFrom: c.priceFrom,
    priceLabel: c.priceLabel,
    image: "/images/hero/hala.jpg",
    href: "/realizacie?priestor=hala-firma",
  })),
];

export function CategoriesShowcase() {
  return (
    <NahladPodlahyProvider>
      <CategoriesShowcaseInner />
    </NahladPodlahyProvider>
  );
}

function CategoriesShowcaseInner() {
  const { otvor } = useNahladPodlahy();
  return (
    <>
      <section
        id="kategorie"
        className="relative bg-[var(--color-copper)] text-white overflow-hidden"
      >
        <Container size="xl" className="pt-10 md:pt-14 pb-10 md:pb-14">
          {/* Header sekcie */}
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[0.7rem] md:text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" aria-hidden />
              NAŠE PORTFÓLIO
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-[#3db6e8]">
              Čo všetko vieme vyčarovať
            </h2>
          </div>

          {/* Karty s kategóriami — každý stĺpec: hlavná karta + 3 farebné
              varianty (zatiaľ dummy "Čoskoro") + vlastný vzorkovník link */}
          <div className="mt-8 md:mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-4">
            {SHOWCASE_CATS.map((cat, idx) => (
              <div
                key={cat.slug}
                className="flex flex-col gap-1.5 md:gap-2"
              >
              <Link
                href={cat.href ?? "/realizacie"}
                aria-label={`Pozrieť realizácie — ${cat.name}`}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#5c2c18] text-left hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8]"
              >
                {/* Horný blok — kocka + nadpis. Pevná výška. */}
                <div className="px-3 pt-2.5 pb-2 md:p-5 md:pb-3 h-[96px] md:h-[150px] flex flex-col">
                  <div className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-3 rounded-md bg-white text-[#5c2c18] group-hover:text-[#3db6e8] flex items-center justify-center p-1 md:p-1.5 transition-colors duration-700 shrink-0">
                    <DiceIcon pips={((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5} />
                  </div>
                  <h3 className="text-[17px] leading-[1.12] md:text-xl lg:text-[22px] font-black text-white tracking-tight md:leading-[1.05]">
                    {cat.name}
                  </h3>
                </div>

                {/* Fotka */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <Image
                    src={cat.image ?? "/images/categories/jednofarebne.jpg"}
                    alt={`${cat.name} epoxidová podlaha`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={85}
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Cena od — biely glassmorphism chip vpravo dole */}
                  <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 inline-flex items-baseline gap-1 px-[8px] py-[4px] md:px-[14px] md:py-[8px] rounded-lg bg-white/95 backdrop-blur-md border border-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.22)] transition-all duration-300">
                    {cat.priceLabel ? (
                      <span className="text-[13px] md:text-[18px] font-bold text-[#1a1a1a] leading-none">
                        {cat.priceLabel}
                      </span>
                    ) : (
                      <>
                        <span className="text-[9px] md:text-[11px] font-normal lowercase text-[#888]">od</span>
                        <span className="text-[13px] md:text-[18px] font-bold text-[#1a1a1a] leading-none">
                          {cat.priceFrom} €
                        </span>
                        <span className="text-[10px] md:text-[12px] font-medium text-[#555]">/m²</span>
                      </>
                    )}
                  </span>
                </div>
              </Link>

              {/* 3 farebné varianty toho istého typu podlahy — klik otvorí
                  náhľad s typom, farbou, vizualizáciou a cestou k CP */}
              {cat.pripravujeme &&
                [0, 1, 2].map((i) => (
                  <div
                    key={`coskoro-${i}`}
                    aria-hidden
                    className="relative aspect-[16/9] rounded-xl border-2 border-dashed border-white/25 bg-[#5c2c18]/60 flex items-center justify-center text-white/50 text-[11px] md:text-xs font-bold uppercase tracking-wide select-none"
                  >
                    Čoskoro
                  </div>
                ))}
              {(VARIANT_PHOTOS[cat.slug] ?? []).map((v, vi) => (
                <button
                  key={v.src}
                  type="button"
                  onClick={() => otvor(VARIANT_PHOTOS[cat.slug], vi, cat.priceFrom || null)}
                  aria-label={`${v.alt} — otvoriť náhľad`}
                  className="group/v relative aspect-[16/9] rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.06] hover:z-10 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] hover:ring-[3px] hover:ring-white focus:outline-none focus-visible:ring-[3px] focus-visible:ring-white"
                >
                  <Image
                    src={v.src}
                    alt={v.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={75}
                    className="object-cover group-hover/v:scale-110 transition-transform duration-500"
                  />
                </button>
              ))}

              {/* Vzorkovník farieb — RAL vzorkovník platí pre jednofarebné
                  a priemyselné. Ostatné kategórie (chips/metal) majú vlastné
                  farebné systémy — ich vzorkovník je zatiaľ čoskoro. */}
              {cat.pripravujeme ? (
                <div
                  aria-disabled
                  className="inline-flex items-center justify-center px-3 py-2.5 md:py-3 rounded-full border-2 border-dashed border-white/25 bg-[#5c2c18]/70 text-white/50 font-bold text-[12px] md:text-sm whitespace-nowrap uppercase tracking-wide select-none cursor-default"
                >
                  Čoskoro
                </div>
              ) : cat.slug === "jednofarebne" || cat.slug === "priemyselne" ? (
                <Link
                  href="/vzorkovnik"
                  aria-label={`Vzorkovník farieb — ${cat.name}`}
                  className="inline-flex items-center justify-center px-3 py-2.5 md:py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-[12px] md:text-sm whitespace-nowrap hover:bg-[#1a8cc4] shadow-[0_6px_20px_rgba(61,182,232,0.35)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  Vzorkovník farieb
                </Link>
              ) : (
                <div
                  aria-disabled
                  className="inline-flex items-center justify-center px-3 py-2.5 md:py-3 rounded-full border-2 border-dashed border-white/25 bg-[#5c2c18]/70 text-white/50 font-bold text-[12px] md:text-sm whitespace-nowrap uppercase tracking-wide select-none cursor-default"
                >
                  Čoskoro
                </div>
              )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
