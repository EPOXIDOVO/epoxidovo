"use client";

import * as React from "react";
import Image from "next/image";
import { NahladPodlahyProvider, useNahladPodlahy } from "@/components/home/NahladPodlahy";
import { TOPSTONE_METALIK } from "@/content/topstone-metalik";
import type { FotkaPodlahy } from "@/content/typ-podlahy";

/**
 * Vzorky efektov, na ktoré sa dá kliknúť — otvoria ten istý náhľad ako
 * fotky na homepage, aj s cestou do vizualizéra a k cenovej ponuke
 * (user 2026-08-25: „na tieto ostatne vzorky vo vzorkovniku sa musi dat
 * tiez kliknut ze by ti ukazalo ten vyber").
 */
export function EfektyGrid({ cenaOd }: { cenaOd?: number | null }) {
  return (
    <NahladPodlahyProvider>
      <EfektyGridInner cenaOd={cenaOd} />
    </NahladPodlahyProvider>
  );
}

function EfektyGridInner({ cenaOd }: { cenaOd?: number | null }) {
  const { otvor } = useNahladPodlahy();

  // Náhľad pracuje s FotkaPodlahy — efekty naň prevedieme, aby vedel
  // predvyplniť vizualizér presne tým odtieňom, na ktorý sa kliklo.
  const fotky: FotkaPodlahy[] = React.useMemo(
    () =>
      TOPSTONE_METALIK.map((e) => ({
        src: e.src,
        typ: "metalicka" as const,
        alt: `Metalická podlaha — ${e.label}`,
        farba: e.label,
        farbaLabel: e.label,
      })),
    [],
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {TOPSTONE_METALIK.map((e, i) => (
        <button
          key={e.id}
          type="button"
          onClick={() => otvor(fotky, i, cenaOd ?? null)}
          aria-label={`${e.label} — otvoriť náhľad`}
          className="group text-left"
        >
          <span className="relative block aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-[#1B2430]/10 transition-all group-hover:ring-[3px] group-hover:ring-[#3db6e8] group-hover:shadow-[0_12px_30px_rgba(27,36,48,0.18)]">
            <Image
              src={e.src}
              alt={`Metalický efekt ${e.label}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              quality={85}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </span>
          <span className="mt-1.5 block text-sm font-bold text-[#1B2430]">{e.label}</span>
        </button>
      ))}
    </div>
  );
}
