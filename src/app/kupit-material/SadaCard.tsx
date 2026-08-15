"use client";

import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import * as React from "react";
import { useCart, type CartItem } from "@/lib/cart";
import type { Sada } from "@/data/sady";

/**
 * Karta sady — „jedno tlačidlo": pridá do košíka VŠETKY položky
 * vypočítané kalkulátorom (dáta prídu zo servera cez props, klient
 * žiadne ceny nepočíta).
 */
export function SadaCard({
  sada,
  items,
  priceLabel,
}: {
  sada: Sada;
  items: CartItem[];
  priceLabel: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = React.useState(false);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden hover:shadow-[0_18px_44px_rgba(0,0,0,0.12)] transition-shadow">
      <div className="relative aspect-[16/9]">
        <Image
          src={sada.image}
          alt={sada.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={85}
          className="object-cover"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide">
          Sada
        </span>
      </div>
      <div className="p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-extrabold text-zinc-900 leading-snug">
          {sada.name}
        </h3>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          {sada.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xl md:text-2xl font-extrabold text-zinc-900">
            {priceLabel}
          </div>
          <button
            type="button"
            onClick={() => {
              add(items);
              setAdded(true);
              setTimeout(() => setAdded(false), 2500);
            }}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white transition-colors ${
              added ? "bg-emerald-600" : "bg-[#f97316] hover:bg-[#ea580c]"
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
    </div>
  );
}
