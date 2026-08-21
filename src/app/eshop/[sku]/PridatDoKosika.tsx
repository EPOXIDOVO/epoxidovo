"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X, Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import { showToast } from "@/components/ui/Toast";

/**
 * „Pridať do košíka" s ponukou skladby — pred pridaním sa otvorí okno:
 * buď len tento produkt, alebo odporúčaná skladba systému od rovnakého
 * výrobcu (penetrácia → hlavná vrstva → vrchný lak; lak sa neponúka,
 * keď JE produkt poslednou vrstvou). Položky skladby sa dajú odškrtnúť.
 */

export type SkladbaPolozka = {
  sku: string;
  nazov: string;
  cena: number;
  foto: string | null;
  krok: string; // "1. Penetrácia" | "2. Hlavná vrstva" | "3. Vrchný lak"
};

const fmt = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function PridatDoKosika({
  produkt,
  skladba,
}: {
  produkt: SkladbaPolozka;
  skladba: SkladbaPolozka[]; // vrátane samotného produktu, v poradí krokov
}) {
  const { add } = useCart();
  const [open, setOpen] = React.useState(false);
  const [pridane, setPridane] = React.useState(false);
  const [vybrane, setVybrane] = React.useState<Set<string>>(
    () => new Set(skladba.map((s) => s.sku)),
  );

  const pridaj = (polozky: SkladbaPolozka[]) => {
    add(
      polozky.map((p) => ({
        productId: p.sku,
        qty: 1,
        systemLabel: polozky.length > 1 ? `Systém ${produkt.nazov}` : undefined,
      })),
    );
    showToast(
      polozky.length > 1
        ? `${polozky.length} položky systému sú v košíku`
        : `${produkt.nazov} je v košíku`,
      "cart",
    );
    setPridane(true);
    setOpen(false);
    setTimeout(() => setPridane(false), 4000);
  };

  const sumaVybranych = skladba
    .filter((s) => vybrane.has(s.sku))
    .reduce((n, s) => n + s.cena, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => (skladba.length > 1 ? setOpen(true) : pridaj([produkt]))}
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#ea580c] text-white font-extrabold hover:bg-[#c2410c] shadow-[0_10px_28px_rgba(249,115,22,0.4)] transition-colors whitespace-nowrap"
      >
        {pridane ? (
          <>
            <Check className="w-5 h-5" aria-hidden /> V košíku —{" "}
            <Link href="/kupit-material/kosik" className="underline">
              zobraziť
            </Link>
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" aria-hidden /> Pridať do košíka
          </>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Pridať do košíka"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold text-[#0e1a3b]">
                Len produkt, alebo celá skladba?
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavrieť"
                className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              Odporúčame kompletný systém — vrstvy od jedného výrobcu sú
              navzájom odladené. Odškrtni, čo už máš.
            </p>

            <div className="mt-4 space-y-2">
              {skladba.map((s) => {
                const jeProdukt = s.sku === produkt.sku;
                const checked = vybrane.has(s.sku);
                return (
                  <label
                    key={s.sku}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-3 cursor-pointer transition-colors ${
                      checked ? "border-[#3db6e8] bg-[#e3f3fb]/40" : "border-zinc-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={jeProdukt}
                      onChange={(e) =>
                        setVybrane((v) => {
                          const n = new Set(v);
                          if (e.target.checked) n.add(s.sku);
                          else n.delete(s.sku);
                          return n;
                        })
                      }
                      className="w-4 h-4 accent-[#3db6e8] shrink-0"
                    />
                    {s.foto ? (
                      <span className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white border border-zinc-200">
                        <Image src={s.foto} alt="" fill sizes="48px" quality={75} className="object-contain p-0.5" />
                      </span>
                    ) : (
                      <span className="w-12 h-12 shrink-0 rounded-lg bg-zinc-100" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-[#1a6e9c]">
                        {s.krok}
                        {jeProdukt && " — tento produkt"}
                      </span>
                      <span className="block text-sm font-bold text-zinc-900 leading-snug line-clamp-2">
                        {s.nazov}
                      </span>
                    </span>
                    <span className="text-sm font-extrabold text-zinc-900 whitespace-nowrap tabular-nums">
                      {fmt.format(s.cena)} €
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => pridaj(skladba.filter((s) => vybrane.has(s.sku)))}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#ea580c] text-white font-extrabold hover:bg-[#c2410c] transition-colors whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4" aria-hidden />
                Pridať vybrané ({fmt.format(sumaVybranych)} €)
              </button>
              <button
                type="button"
                onClick={() => pridaj([produkt])}
                className="inline-flex items-center justify-center px-5 py-3.5 rounded-full border-2 border-zinc-300 font-bold text-zinc-700 hover:border-[#3db6e8] hover:text-[#1a8cc4] transition-colors whitespace-nowrap"
              >
                Len tento produkt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
