"use client";

import * as React from "react";
import Image from "next/image";
import { Palette } from "lucide-react";
import Link from "next/link";
import { RAL_CLASSIC_FULL as RAL_CLASSIC, type RalSwatch } from "@/content/ral-classic";

/**
 * Výber RAL odtieňa + živý náhľad — fotka reálnej podlahy sa prefarbí
 * do zvoleného odtieňa (CSS blend „color" drží svetlá a tiene fotky,
 * mení len farbu → vyzerá ako reálna podlaha v danom RAL).
 */

const SKUPINY_LABELS: Record<string, string> = {
  greys: "Sivé",
  whites: "Biele",
  "beiges-browns": "Béžové a hnedé",
  blues: "Modré",
  greens: "Zelené",
  "reds-pinks": "Červené",
  violets: "Fialové",
  "yellows-oranges": "Žlté a oranžové",
  blacks: "Čierne",
};

export function RalNahlad({
  fotoSrc,
  fotoLabel,
}: {
  fotoSrc: string;
  fotoLabel: string;
}) {
  const [ral, setRal] = React.useState<RalSwatch | null>(null);

  const skupiny = React.useMemo(() => {
    const g = new Map<string, RalSwatch[]>();
    for (const r of RAL_CLASSIC) {
      const arr = g.get(r.skupina);
      if (arr) arr.push(r);
      else g.set(r.skupina, [r]);
    }
    return [...g.entries()];
  }, []);

  return (
    <figure className="relative rounded-3xl overflow-hidden border border-zinc-200 bg-white">
      <div className="relative aspect-[16/9]">
        <Image
          src={fotoSrc}
          alt={fotoLabel}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={85}
          className="object-cover"
        />
        {ral && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: ral.hex, mixBlendMode: "color" }}
          />
        )}
        <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-4 pt-8 pb-3 text-white text-sm font-semibold flex items-center justify-between gap-2">
          <span>{ral ? `Náhľad v odtieni ${ral.kod} — ${ral.nazov}` : fotoLabel}</span>
          {ral && (
            <span
              className="inline-block w-6 h-6 rounded-full border-2 border-white/80 shrink-0"
              style={{ backgroundColor: ral.hex }}
            />
          )}
        </figcaption>
      </div>
      <div className="p-3.5 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-900">
          <Palette className="w-4 h-4 text-[#12729f]" aria-hidden />
          Odtieň RAL:
        </span>
        <select
          value={ral?.kod ?? ""}
          onChange={(e) => {
            const r = RAL_CLASSIC.find((x: RalSwatch) => x.kod === e.target.value) ?? null;
            setRal(r);
          }}
          aria-label="Výber RAL odtieňa"
          className="flex-1 min-w-44 px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#3db6e8] cursor-pointer"
        >
          <option value="">— vyber farbu (213 odtieňov) —</option>
          {skupiny.map(([id, farby]) => (
            <optgroup key={id} label={SKUPINY_LABELS[id] ?? id}>
              {farby.map((r) => (
                <option key={r.kod} value={r.kod}>
                  {r.kod} — {r.nazov}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="w-full text-[11px] text-zinc-400 leading-snug">
          Náhľad je orientačný — displej nie je kalibrovaný. Presný odtieň si
          over vo{" "}
          <Link href="/vzorkovnik" className="text-[#1a8cc4] font-semibold hover:underline">
            vzorkovníku RAL
          </Link>
          . Materiál miešame na objednávku v ľubovoľnom RAL odtieni.
        </p>
      </div>
    </figure>
  );
}
