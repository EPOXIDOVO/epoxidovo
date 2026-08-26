"use client";

import * as React from "react";
import Image from "next/image";
import type { ArturoFarba } from "@/content/arturo-farby";

/**
 * Mriežka vzoriek Arturo s veľkým náhľadom.
 *
 * Klik na vzorku otvorí modál s väčším obrázkom — na malej dlaždici sa
 * štruktúra povrchu nedá posúdiť. Šípkami sa preklikáva celý rad,
 * Esc a klik mimo zatvárajú.
 */
import { NahladPodlahyProvider, useNahladPodlahy } from "@/components/home/NahladPodlahy";
import { ARTURO_RAD_NA_TYP } from "@/content/arturo-farby";
import type { FotkaPodlahy, TypPodlahy } from "@/content/typ-podlahy";

/** Rad Arturo → tag typu podlahy, aby náhľad vedel ponúknuť vizualizér a CP. */
const RAD_NA_TAG: Record<string, TypPodlahy> = {
  Unicolor: "jednofarebna",
  "Concrete look": "beton-look",
  Concreta: "beton-look",
  Mistral: "mistral",
};

/**
 * Vzorky Arturo. Klik otvára TEN ISTÝ náhľad ako fotky na homepage —
 * user 2026-08-25: „v celom vzorkovniku pridaj ku materialu aj ai
 * vizualizator … nech funguje rovnako ako na co vsetko vieme vycarovat".
 * Vlastný modál tu bol predtým bez tlačidiel, takže z neho nikam neviedla
 * cesta.
 */
export function ArturoGrid({
  typy,
  farby,
  cenaOd,
}: {
  typy: readonly string[];
  farby: ArturoFarba[];
  cenaOd?: number | null;
}) {
  return (
    <NahladPodlahyProvider>
      <ArturoGridInner typy={typy} farby={farby} cenaOd={cenaOd} />
    </NahladPodlahyProvider>
  );
}

function ArturoGridInner({
  typy,
  farby,
  cenaOd,
}: {
  typy: readonly string[];
  farby: ArturoFarba[];
  cenaOd?: number | null;
}) {
  const { otvor } = useNahladPodlahy();

  const fotky: FotkaPodlahy[] = React.useMemo(
    () =>
      farby.map((f) => ({
        src: f.obrazok,
        typ: RAD_NA_TAG[f.typ] ?? "beton-look",
        alt: `${f.typ} — ${f.nazov}`,
        farba: f.sku ?? f.nazov,
        farbaLabel: f.nazov,
      })),
    [farby],
  );

  return (
    <div className="space-y-8">
      {typy.map((rad) => {
        const vRade = farby
          .map((f, i) => ({ f, i }))
          .filter(({ f }) => f.typ === rad);
        if (vRade.length === 0) return null;
        return (
          <section key={rad}>
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
              {rad}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {vRade.map(({ f, i }) => (
                <button
                  key={f.obrazok}
                  type="button"
                  onClick={() => otvor(fotky, i, cenaOd ?? null)}
                  aria-label={`${f.nazov} — otvoriť náhľad`}
                  className="group text-left"
                >
                  <span className="relative block aspect-square rounded-xl overflow-hidden ring-1 ring-[#1B2430]/10 transition-all group-hover:ring-[3px] group-hover:ring-[#3db6e8] group-hover:shadow-[0_10px_26px_rgba(27,36,48,0.16)]">
                    <Image
                      src={f.obrazok}
                      alt={f.nazov}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-1.5 block text-sm font-bold text-[#1B2430]">
                    {f.nazov}
                  </span>
                  {f.sku && (
                    <span className="block text-[11px] text-[#1B2430]/45">{f.sku}</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
