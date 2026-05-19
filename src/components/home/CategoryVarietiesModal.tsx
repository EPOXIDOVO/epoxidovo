"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { REALIZACIE } from "@/content/realizacie";

/**
 * Modal s vzormi (galéria) pre konkrétnu kategóriu podlahy.
 * Otvára sa pri klikoch na karty v CategoriesShowcase.
 *
 * Vzory ťahajú z `/content/realizacie.ts` — fotky filtrované podľa kategórie.
 */

interface CategoryVarieties {
  slug: string;
  name: string;
  varieties: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  jednofarebne: "Hladké jednofarebné",
  chipsove: "Chipsové podlahy",
  mramorove: "Mramorové epoxidové efekty",
  metalicke: "Metalické epoxidové podlahy",
};

// Fallback fotky pre kategórie ktoré ešte nemajú realne realizácie
const FALLBACK_VARIETIES: Record<string, string[]> = {
  chipsove: ["/images/categories/chipsove.jpg"],
};

function getVarieties(slug: string): CategoryVarieties {
  const fromRealizacie = REALIZACIE
    .filter((r) => r.category === slug)
    .map((r) => r.src);
  return {
    slug,
    name: CATEGORY_LABELS[slug] || slug,
    varieties: fromRealizacie.length > 0
      ? fromRealizacie
      : FALLBACK_VARIETIES[slug] || [],
  };
}

interface CategoryVarietiesModalProps {
  open: boolean;
  categorySlug: string | null;
  onClose: () => void;
}

export function CategoryVarietiesModal({
  open,
  categorySlug,
  onClose,
}: CategoryVarietiesModalProps) {
  const [activeIdx, setActiveIdx] = React.useState(0);

  const data = React.useMemo(
    () => (categorySlug ? getVarieties(categorySlug) : null),
    [categorySlug],
  );

  // Reset active index keď sa zmení kategória
  React.useEffect(() => {
    setActiveIdx(0);
  }, [categorySlug]);

  // ESC + arrows
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        if (data) setActiveIdx((i) => (i + 1) % data.varieties.length);
      }
      if (e.key === "ArrowLeft") {
        if (data)
          setActiveIdx(
            (i) => (i - 1 + data.varieties.length) % data.varieties.length,
          );
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, data, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!data || data.varieties.length === 0) return null;

  const total = data.varieties.length;
  const next = () => setActiveIdx((i) => (i + 1) % total);
  const prev = () => setActiveIdx((i) => (i - 1 + total) % total);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="varieties-title"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Zavrieť"
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
        tabIndex={open ? 0 : -1}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-5xl mx-3 md:mx-auto",
          "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-y-0 scale-100" : "translate-y-8 scale-95",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-[#3db6e8]">
              Vzory
            </p>
            <h2
              id="varieties-title"
              className="mt-1 text-xl md:text-2xl font-bold"
            >
              {data.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavrieť"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Hlavný obrázok */}
        <div className="relative aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-black/40">
          {data.varieties.map((src, idx) => (
            <Image
              key={src + idx}
              src={src}
              alt={`${data.name} — vzor ${idx + 1}`}
              fill
              priority={idx === activeIdx}
              sizes="(max-width: 1024px) 100vw, 1280px"
              className={cn(
                "object-cover transition-opacity duration-500",
                idx === activeIdx ? "opacity-100" : "opacity-0",
              )}
            />
          ))}

          {/* Prev/Next */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Predchádzajúci"
                className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Nasledujúci"
                className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" aria-hidden />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-mono">
            {activeIdx + 1} / {total}
          </div>
        </div>

        {/* Thumbnails */}
        {total > 1 && (
          <div className="mt-4 flex gap-2 px-2 overflow-x-auto scrollbar-hide">
            {data.varieties.map((src, idx) => (
              <button
                key={src + idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`Zobraziť vzor ${idx + 1}`}
                className={cn(
                  "relative shrink-0 w-20 h-16 md:w-24 md:h-20 rounded-lg overflow-hidden transition-all",
                  idx === activeIdx
                    ? "ring-2 ring-[#3db6e8] scale-105"
                    : "ring-1 ring-white/20 hover:ring-white/50 opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
