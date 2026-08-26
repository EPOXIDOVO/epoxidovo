"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TYPY_PODLAH, type TypPodlahyKarta } from "@/content/typy-podlah";
import { TOPSTONE_METALIK } from "@/content/topstone-metalik";
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


/**
 * Kam vedie tlačidlo „Vzorkovník farieb". Metalické majú od 2026-08-25
 * kompletnú kolekciu TopStone EP11 (18 odtieňov), tak už tam nie je
 * „Čoskoro". Kategórie, ktoré tu nie sú, ho stále nemajú.
 */
/**
 * Čím listujú šípky v náhľade. Pri metalických nechceme zavrieť človeka
 * do troch fotiek z dlaždice — user 2026-08-25: „nech ma to nelimituje iba
 * na tie 3 fotky … nech mi to proste zacne scrollovat … celom vzorkovniku
 * a scrollujes az dole uplne na poslednu". Vrátime celú kolekciu a index
 * fotky, na ktorú sa kliklo, aby šípky pokračovali od nej až na koniec.
 */
function zoznamPreNahlad(
  cat: TypPodlahyKarta,
  index: number,
): { fotky: FotkaPodlahy[]; index: number } {
  if (cat.slug !== "metalicke") return { fotky: cat.variants, index };

  const cela: FotkaPodlahy[] = TOPSTONE_METALIK.map((e) => ({
    src: e.src,
    typ: "metalicka" as const,
    alt: `Metalická podlaha — ${e.label}`,
    farba: e.label,
    farbaLabel: e.label,
  }));
  const kliknuta = cat.variants[index]?.src;
  const i = cela.findIndex((f) => f.src === kliknuta);
  return { fotky: cela, index: i >= 0 ? i : 0 };
}

const VZORKOVNIK_TYP: Record<string, string> = {
  jednofarebne: "/vzorkovnik?typ=jednofarebne",
  priemyselne: "/vzorkovnik?typ=priemyselne",
  metalicke: "/vzorkovnik?typ=metalicke",
};

/**
 * `cenyOd` prichádza zo servera z NajCRM (@/lib/cennik-od) — tá istá matica,
 * z akej ráta konfigurátor. Keď ho stránka nepošle alebo CRM neodpovie,
 * padáme na statické `priceFrom`, nech dlaždica nikdy neostane bez ceny.
 */
export function CategoriesShowcase({ cenyOd }: { cenyOd?: Record<string, number> }) {
  return (
    <NahladPodlahyProvider>
      <CategoriesShowcaseInner cenyOd={cenyOd} />
    </NahladPodlahyProvider>
  );
}

function CategoriesShowcaseInner({ cenyOd }: { cenyOd?: Record<string, number> }) {
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
            {TYPY_PODLAH.map((cat, idx) => (
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
                          {cenyOd?.[cat.slug] ?? cat.priceFrom} €
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
              {(cat.variants ?? []).map((v, vi) => (
                <button
                  key={v.src}
                  type="button"
                  onClick={() => {
                    const z = zoznamPreNahlad(cat, vi);
                    otvor(z.fotky, z.index, cenyOd?.[cat.slug] ?? cat.priceFrom ?? null);
                  }}
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
              ) : VZORKOVNIK_TYP[cat.slug] ? (
                <Link
                  href={VZORKOVNIK_TYP[cat.slug]}
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
