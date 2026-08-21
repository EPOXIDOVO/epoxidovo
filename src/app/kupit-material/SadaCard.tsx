"use client";

import Image from "next/image";
import { ShoppingCart, Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { showToast } from "@/components/ui/Toast";
import type { Sada } from "@/data/sady";

/**
 * Karta sady — fotka 4:3, jeden badge SADA, chipy pod nadpisom,
 * cenová hierarchia €/m² → spolu → DPH poznámka, „Čo je v sade"
 * ako spodná rozbaľovacia lišta. Dáta (items, obsah, cena) prichádzajú
 * zo servera — klient nič nepočíta okrem delenia cena/plocha.
 */

const fmtEur = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function SadaCard({
  sada,
  items,
  obsah,
  priceEur,
  priceIsFinal,
}: {
  sada: Sada;
  items: CartItem[];
  obsah: string[];
  priceEur: number;
  priceIsFinal: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const prefix = priceIsFinal ? "" : "od ";
  const perM2 = priceEur / sada.areaM2;

  return (
    <article className="flex flex-col h-full rounded-2xl border border-[#e4e4e7] bg-white overflow-hidden hover:-translate-y-[2px] hover:shadow-[0_14px_36px_rgba(14,26,59,0.12)] transition-[transform,box-shadow] duration-150">
      <div className="relative aspect-[4/3] max-h-[260px] w-full overflow-hidden rounded-t-2xl">
        <Image
          src={sada.image}
          alt={sada.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
          className="object-cover"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0e1a3b]/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide">
          Sada
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-extrabold text-[#0e1a3b] leading-snug tracking-tight">
          {sada.name}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-[#4a5478] font-semibold">
            Vrátane {sada.reservePct} % rezervy
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-[#4a5478] font-semibold">
            Celé balenia
          </span>
        </div>
        <p className="mt-2.5 text-sm text-[#4a5478] leading-relaxed">
          {sada.description}
        </p>

        {/* Cena + CTA — vždy pri spodku karty */}
        <div className="mt-auto pt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="tnum text-2xl font-extrabold text-[#0e1a3b]">
              {prefix}
              {fmtEur.format(perM2)} €/m²
            </div>
            <div className="tnum mt-0.5 text-[13px] text-[#6b7390] whitespace-nowrap">
              spolu {prefix}
              {fmtEur.format(priceEur)} € · {sada.areaM2} m²
            </div>
            <div className="mt-0.5 text-xs text-[#6b7390]">
              Konečná cena — nie sme platiteľ DPH
            </div>
          </div>
          <button
            type="button"
            data-magnetic
            onClick={() => {
              add(items);
              showToast(`${sada.name} je v košíku`, "cart");
              setAdded(true);
              setTimeout(() => setAdded(false), 2500);
            }}
            className={`press-scale w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-bold text-white whitespace-nowrap transition-colors ${
              added
                ? "bg-emerald-600"
                : "bg-[#ea580c] hover:bg-[#c2410c] shadow-[0_10px_28px_rgba(249,115,22,0.4)]"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" aria-hidden /> V košíku
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" aria-hidden /> Do košíka
              </>
            )}
          </button>
        </div>
      </div>

      {/* Spodná lišta — rozbaliteľný obsah sady */}
      <div className="border-t border-[#f0f0ee]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-2 px-5 py-3 text-sm font-bold text-[#1a8cc4] hover:bg-[#f7f6f3] transition-colors"
        >
          Čo je v sade ({obsah.length})
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <ul className="overflow-hidden text-sm text-[#4a5478] px-5">
            {obsah.map((o) => (
              <li key={o} className="flex items-start gap-2 pb-1.5 last:pb-4">
                <Check className="w-3.5 h-3.5 mt-1 shrink-0 text-[#16a34a]" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
