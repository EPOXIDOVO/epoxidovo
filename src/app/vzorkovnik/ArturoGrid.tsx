"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ArturoFarba } from "@/content/arturo-farby";

/**
 * Mriežka vzoriek Arturo s veľkým náhľadom.
 *
 * Klik na vzorku otvorí modál s väčším obrázkom — na malej dlaždici sa
 * štruktúra povrchu nedá posúdiť. Šípkami sa preklikáva celý rad,
 * Esc a klik mimo zatvárajú.
 */
export function ArturoGrid({
  typy,
  farby,
}: {
  typy: readonly string[];
  farby: ArturoFarba[];
}) {
  const [otvorena, setOtvorena] = React.useState<number | null>(null);

  const posun = React.useCallback(
    (o: number) =>
      setOtvorena((i) => (i == null ? null : (i + o + farby.length) % farby.length)),
    [farby.length],
  );

  React.useEffect(() => {
    if (otvorena == null) return;
    const klaves = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOtvorena(null);
      if (e.key === "ArrowRight") posun(1);
      if (e.key === "ArrowLeft") posun(-1);
    };
    window.addEventListener("keydown", klaves);
    // zamkni scroll pozadia, nech modál neuteká
    const povodne = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", klaves);
      document.body.style.overflow = povodne;
    };
  }, [otvorena, posun]);

  const f = otvorena == null ? null : farby[otvorena];

  return (
    <>
      <div className="space-y-8">
        {typy
          .filter((t) => farby.some((x) => x.typ === t))
          .map((t) => (
            <div key={t}>
              <h2 className="text-sm font-black uppercase tracking-wide text-[#1B2430]/50 mb-3">
                {t}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {farby
                  .map((x, i) => ({ x, i }))
                  .filter(({ x }) => x.typ === t)
                  .map(({ x, i }) => (
                    <button
                      key={`${x.typ}-${x.nazov}`}
                      type="button"
                      onClick={() => setOtvorena(i)}
                      className="group text-left focus:outline-none"
                    >
                      <span className="relative block aspect-square rounded-xl overflow-hidden ring-1 ring-[#1B2430]/10 group-hover:ring-2 group-hover:ring-[#3db6e8] transition-all">
                        <Image
                          src={x.obrazok}
                          alt={`Arturo ${x.typ} ${x.nazov}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 17vw"
                          quality={85}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </span>
                      <span className="mt-1.5 block text-[13px] font-bold text-[#1B2430] leading-snug group-hover:text-[#1a8cc4] transition-colors">
                        {x.nazov}
                      </span>
                      {x.sku && (
                        <span className="block text-[11px] text-[#1B2430]/50">{x.sku}</span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
      </div>

      {f && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setOtvorena(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${f.typ} ${f.nazov}`}
        >
          <div
            className="relative w-full max-w-2xl my-auto rounded-3xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOtvorena(null)}
              aria-label="Zavrieť náhľad"
              className="absolute top-3 right-3 z-10 w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/90 text-[#1B2430] shadow hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" aria-hidden />
            </button>
            <div className="relative aspect-square max-h-[62vh] w-full bg-zinc-100">
              <Image
                src={f.obrazok}
                alt={`Arturo ${f.typ} ${f.nazov}`}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                quality={92}
                className="object-cover"
                priority
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <button
                type="button"
                onClick={() => posun(-1)}
                aria-label="Predchádzajúci odtieň"
                className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full border-2 border-zinc-200 text-[#1B2430] hover:border-[#3db6e8] hover:text-[#1a8cc4] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden />
              </button>
              <div className="text-center min-w-0">
                <div className="text-[11px] font-black uppercase tracking-wide text-[#1B2430]/50">
                  {f.typ}
                </div>
                <div className="text-lg font-black text-[#1B2430] leading-tight">{f.nazov}</div>
                {f.sku && <div className="text-xs text-[#1B2430]/50">{f.sku}</div>}
              </div>
              <button
                type="button"
                onClick={() => posun(1)}
                aria-label="Ďalší odtieň"
                className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full border-2 border-zinc-200 text-[#1B2430] hover:border-[#3db6e8] hover:text-[#1a8cc4] transition-colors"
              >
                <ChevronRight className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
