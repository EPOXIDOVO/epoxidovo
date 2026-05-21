"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { CATEGORIES } from "@/content/categories";

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

export function CategoriesShowcase() {
  return (
    <>
      <section
        id="kategorie"
        className="relative bg-[var(--color-copper)] text-white overflow-hidden"
      >
        <Container size="xl" className="py-12 md:py-28 lg:py-32">
          {/* Header sekcie */}
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[0.7rem] md:text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" aria-hidden />
              NAŠE TYPY PODLÁH
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              <span className="text-[#3db6e8]">Vyber si štýl,</span>
              <br />
              ktorý ti sedí
            </h2>
          </div>

          {/* Karty s kategóriami */}
          <div className="mt-8 md:mt-16 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 md:gap-5">
            {CATEGORIES.map((cat, idx) => (
              <div
                key={cat.slug}
                className={`group relative flex flex-col rounded-2xl overflow-hidden bg-[#5c2c18] text-left ${
                  idx === 4 ? "col-span-2 md:col-span-1" : ""
                }`}
              >
                {/* Horný blok — kocka + nadpis. Pevná výška. */}
                <div className="px-3 pt-2.5 pb-2 md:p-7 md:pb-4 h-[78px] md:h-[180px] flex flex-col">
                  <div className="w-6 h-6 md:w-10 md:h-10 mb-1 md:mb-5 rounded-md bg-white text-[#5c2c18] group-hover:text-[#3db6e8] flex items-center justify-center p-1 md:p-1.5 transition-colors duration-700 shrink-0">
                    <DiceIcon pips={(idx + 1) as 1 | 2 | 3 | 4 | 5} />
                  </div>
                  <h3 className="text-[13px] leading-[1.15] md:text-2xl lg:text-[28px] font-black text-white tracking-tight md:leading-[1.05]">
                    {cat.name === "Jednofarebné"
                      ? "Hladké jednofarebné"
                      : cat.name}
                  </h3>
                </div>

                {/* Fotka */}
                <div className={`relative overflow-hidden ${idx === 4 ? "aspect-[16/7] md:aspect-[4/3]" : "aspect-[4/3] md:aspect-[4/3]"}`}>
                  <Image
                    src={
                      cat.slug === "jednofarebne"
                        ? "/images/hero/byvanie-v2.webp"
                        : cat.slug === "priemyselne"
                        ? "/images/realizacie/r-22.jpg"
                        : `/images/categories/${cat.slug}.jpg`
                    }
                    alt={`${cat.name} epoxidová podlaha`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Cena od — biely glassmorphism chip vpravo dole */}
                  <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 inline-flex items-baseline gap-1 px-[8px] py-[4px] md:px-[14px] md:py-[8px] rounded-lg bg-white/95 backdrop-blur-md border border-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.22)] transition-all duration-300">
                    {cat.priceLabel ? (
                      <span className="text-[11px] md:text-[14px] font-bold text-[#1a1a1a] leading-none">
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
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
