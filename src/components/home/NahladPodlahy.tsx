"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Sparkles, FileText, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { TYP_PODLAHY_LABEL, TYP_NA_VZHLAD, type FotkaPodlahy } from "@/content/typ-podlahy";

/**
 * Náhľad fotky podlahy — veľký obrázok, typ, farba, a dve cesty ďalej:
 * AI vizualizácia v mojom priestore a cenová ponuka. Obe odchádzajú
 * s predvoleným typom, aby zákazník neklikal dvakrát to isté.
 */

type Ctx = {
  otvor: (fotky: FotkaPodlahy[], index: number, cenaOd?: number | null) => void;
};
const NahladCtx = React.createContext<Ctx | null>(null);

export function useNahladPodlahy() {
  const c = React.useContext(NahladCtx);
  if (!c) throw new Error("useNahladPodlahy mimo NahladPodlahyProvider");
  return c;
}

/** Slug vizualizéra pre typ — vizualizér pozná len 4 textúry. */
const TYP_NA_TEXTURU: Record<string, string | null> = {
  jednofarebna: "hladka",
  chipsova: "chips",
  mramorova: "mramor",
  metalicka: "metalicka",
  priemyselna: "hladka",
  "beton-look": null,
};

export function NahladPodlahyProvider({ children }: { children: React.ReactNode }) {
  const [stav, setStav] = React.useState<{ fotky: FotkaPodlahy[]; i: number; cenaOd: number | null } | null>(null);

  const otvor = React.useCallback((fotky: FotkaPodlahy[], index: number, cenaOd?: number | null) => {
    setStav({ fotky, i: index, cenaOd: cenaOd ?? null });
  }, []);
  const zavri = () => setStav(null);
  const posun = (o: number) =>
    setStav((s) => (s ? { ...s, i: (s.i + o + s.fotky.length) % s.fotky.length } : s));

  React.useEffect(() => {
    if (!stav) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") zavri();
      if (e.key === "ArrowRight") posun(1);
      if (e.key === "ArrowLeft") posun(-1);
    };
    window.addEventListener("keydown", k);
    const o = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = o;
    };
  }, [stav]);

  const f = stav ? stav.fotky[stav.i] : null;
  const textura = f ? TYP_NA_TEXTURU[f.typ] : null;
  const vzhlad = f ? TYP_NA_VZHLAD[f.typ] : null;
  const farbaParam = f?.farba ? `&farba=${encodeURIComponent(f.farba)}` : "";

  return (
    <NahladCtx.Provider value={{ otvor }}>
      {children}
      {f && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 md:p-6 overflow-y-auto"
          onClick={zavri}
          role="dialog"
          aria-modal="true"
          aria-label={`${TYP_PODLAHY_LABEL[f.typ]} podlaha`}
        >
          <div
            className="relative w-full max-w-3xl my-auto rounded-3xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={zavri}
              aria-label="Zavrieť náhľad"
              className="absolute top-3 right-3 z-10 w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/90 text-[#1B2430] shadow hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" aria-hidden />
            </button>

            <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-zinc-100">
              <Image
                src={f.src}
                alt={f.alt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                quality={92}
                className="object-cover"
                priority
              />
              {stav!.fotky.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => posun(-1)}
                    aria-label="Predchádzajúca fotka"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/90 text-[#1B2430] shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => posun(1)}
                    aria-label="Ďalšia fotka"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/90 text-[#1B2430] shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden />
                  </button>
                </>
              )}
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0e1a3b] text-white text-[11px] md:text-xs font-extrabold uppercase tracking-wide">
                {TYP_PODLAHY_LABEL[f.typ]}
              </span>
            </div>

            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xl md:text-2xl font-black text-[#1B2430] leading-tight">
                    {TYP_PODLAHY_LABEL[f.typ]} podlaha
                  </div>
                  {(f.farbaLabel || f.farba) && (
                    <div className="mt-1 text-sm text-[#1B2430]/70">
                      Farba: <span className="font-bold text-[#1B2430]">{f.farbaLabel ?? f.farba}</span>
                      {f.farba && f.farbaLabel && f.farba !== f.farbaLabel && (
                        <span className="text-[#1B2430]/50"> · {f.farba}</span>
                      )}
                    </div>
                  )}
                </div>
                {stav!.cenaOd != null && stav!.cenaOd > 0 && (
                  <div className="shrink-0 rounded-xl bg-[#f4f5f7] px-4 py-2 text-right">
                    <div className="text-[11px] uppercase tracking-wide text-[#1B2430]/50 font-bold">Realizácia od</div>
                    <div className="text-xl font-black text-[#1B2430] tabular-nums">
                      {stav!.cenaOd} € <span className="text-sm font-bold text-[#1B2430]/60">/m²</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {textura ? (
                  <Link
                    href={`/ai-vizualizer?texture=${textura}${farbaParam}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#3db6e8] to-[#a855f7] text-white font-bold text-sm md:text-base shadow-[0_6px_20px_rgba(168,85,247,0.35)] hover:-translate-y-0.5 transition-all whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden />
                    Pozrieť v mojom priestore
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border-2 border-dashed border-zinc-300 text-zinc-400 font-bold text-sm whitespace-nowrap cursor-default">
                    <Sparkles className="w-4 h-4" aria-hidden />
                    Vizualizácia čoskoro
                  </span>
                )}
                <Link
                  href={`/navrhni-podlahu?vzhlad=${vzhlad}${farbaParam}&cp=1`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#ea580c] text-white font-bold text-sm md:text-base shadow-[0_6px_20px_rgba(234,88,12,0.35)] hover:bg-[#c2410c] hover:-translate-y-0.5 transition-all whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" aria-hidden />
                  Chcem cenovú ponuku
                </Link>
                <Link
                  href={`/eshop?vzhlad=${vzhlad}#katalog`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#0e1a3b] text-white font-bold text-sm md:text-base hover:bg-[#1a2b57] hover:-translate-y-0.5 transition-all whitespace-nowrap"
                >
                  <ShoppingCart className="w-4 h-4" aria-hidden />
                  Kúpiť materiál
                </Link>
              </div>
              <p className="mt-3 text-xs text-[#1B2430]/55 text-center">
                Cenu uvidíš hneď — kontakt vyplníš, len ak budeš chcieť, aby sme sa ozvali.
              </p>
            </div>
          </div>
        </div>
      )}
    </NahladCtx.Provider>
  );
}
