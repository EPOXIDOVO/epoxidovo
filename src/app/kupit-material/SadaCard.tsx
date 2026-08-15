"use client";

import Image from "next/image";
import { ShoppingCart, Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { showToast } from "@/components/ui/Toast";
import { SpotlightCard } from "@/components/ui/Spotlight";
import type { Sada } from "@/data/sady";

/**
 * Karta sady — fotka, badge SADA, rozbaliteľný „Čo je v sade",
 * badge „Vrátane 5 % rezervy" / „Celé balenia", jedno CTA do košíka.
 * Dáta (items, obsah, cena) prichádzajú zo servera — klient nič nepočíta.
 */
export function SadaCard({
  sada,
  items,
  obsah,
  priceLabel,
}: {
  sada: Sada;
  items: CartItem[];
  obsah: string[];
  priceLabel: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <SpotlightCard
      as="article"
      className="h-full rounded-3xl border border-[#e4e4e7] bg-white overflow-hidden hover:shadow-[0_18px_44px_rgba(14,26,59,0.14)] transition-shadow duration-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={sada.image}
          alt={sada.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={85}
          className="object-cover hover:scale-[1.04] transition-transform duration-700"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0e1a3b]/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide">
          Sada
        </span>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#0e1a3b] text-[11px] font-bold shadow">
            Vrátane {sada.reservePct} % rezervy
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#0e1a3b] text-[11px] font-bold shadow">
            Celé balenia
          </span>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-extrabold text-[#0e1a3b] leading-snug tracking-tight">
          {sada.name}
        </h3>
        <p className="mt-2 text-sm text-[#4a5478] leading-relaxed">
          {sada.description}
        </p>

        {/* Rozbaliteľný obsah sady */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1a8cc4] hover:text-[#0e1a3b] transition-colors"
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
          <ul className="overflow-hidden text-sm text-[#4a5478]">
            {obsah.map((o) => (
              <li key={o} className="flex items-start gap-2 pt-1.5 first:pt-2">
                <Check className="w-3.5 h-3.5 mt-1 shrink-0 text-[#16a34a]" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-[#f0f0ee] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="tnum text-xl md:text-2xl font-extrabold text-[#0e1a3b]">
              {priceLabel}
            </div>
            <div className="text-[11px] text-[#6b7390]">
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
            className={`press-scale inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white whitespace-nowrap transition-colors ${
              added
                ? "bg-emerald-600"
                : "bg-[#f97316] hover:bg-[#ea580c] shadow-[0_10px_28px_rgba(249,115,22,0.4)]"
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
    </SpotlightCard>
  );
}
