"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, SpaceType } from "@/content/categories";
import { REALIZACIE } from "@/content/realizacie";

interface GalleryViewProps {
  categories: Category[];
  spaceTypes: SpaceType[];
}

/**
 * Klient-side galéria s filtrovaním cez URL params.
 * URL: /realizacie?kategoria=jednofarebne&priestor=dom
 */
export function GalleryView({ categories, spaceTypes }: GalleryViewProps) {
  const router = useRouter();
  const params = useSearchParams();
  const activeCategory = params.get("kategoria") || "all";
  const activeSpace = params.get("priestor") || "all";
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  const setFilter = (key: "kategoria" | "priestor", value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    // Pri zmene priestoru vždy resetuj kategóriu na "Všetky" — používateľ chce
    // čistý štart, nie si manuálne pamätať či kombinácia má fotky.
    if (key === "priestor") {
      next.delete("kategoria");
    }
    router.replace(`/realizacie?${next.toString()}`, { scroll: false });
  };

  const filtered = React.useMemo(
    () =>
      REALIZACIE.filter(
        (p) =>
          (activeCategory === "all" || p.category === activeCategory) &&
          (activeSpace === "all" || p.space === activeSpace),
      ),
    [activeCategory, activeSpace],
  );

  // Keyboard navigation v lightboxe
  React.useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : (i + 1) % filtered.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, filtered.length]);

  return (
    <div>
      {/* Filtre */}
      <div className="space-y-2.5 md:space-y-4 mb-5 md:mb-10">
        <FilterRow
          label="Typ priestoru"
          active={activeSpace}
          onChange={(v) => setFilter("priestor", v)}
          options={[
            { value: "all", label: "Všetky priestory", shortLabel: "Všetky" },
            ...spaceTypes.map((s) => ({ value: s.slug, label: s.name })),
          ]}
        />
        <FilterRow
          label="Vzor podlahy"
          active={activeCategory}
          onChange={(v) => setFilter("kategoria", v)}
          options={[
            { value: "all", label: "Všetky vzory", shortLabel: "Všetky" },
            ...categories
              .filter((c) => {
                // "priemyselne" je iba display kategoria v homepage karty — nepouziva sa pre realizacie filter
                if (c.slug === "priemyselne") return false;
                if (activeSpace === "hala-firma") return c.slug === "jednofarebne";
                if (activeSpace === "dom") return c.slug !== "chipsove";
                return true;
              })
              .map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </div>

      <p className="text-sm md:text-lg font-semibold text-white mb-3 md:mb-6">
        <span className="font-bold">{filtered.length}</span>{" "}
        {filtered.length === 1
          ? "realizácia"
          : filtered.length < 5
          ? "realizácie"
          : "realizácií"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-white/80">
            Pre túto kombináciu zatiaľ nemáme realizácie. Skús zmeniť filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((photo, i) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIdx(i)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (i % 12) * 0.04 }}
              className="group relative aspect-square overflow-hidden rounded-xl bg-black/20 hover:scale-[1.02] transition-transform duration-500"
              aria-label={`Otvoriť fotku ${photo.id}: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {photo.labels && photo.labels.length > 0 && (
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start max-w-[calc(100%-1rem)]">
                  {photo.labels.map((l) => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/80 text-white text-[10px] md:text-xs font-bold tracking-wide backdrop-blur-sm shadow-md"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
          onTouchStart={(e) => {
            // @ts-expect-error mutable
            e.currentTarget._touchX = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            // @ts-expect-error mutable
            const startX = e.currentTarget._touchX as number | undefined;
            if (typeof startX !== "number") return;
            const endX = e.changedTouches[0].clientX;
            const dx = endX - startX;
            if (Math.abs(dx) < 50) return; // ignore taps
            e.stopPropagation();
            if (dx > 0) {
              setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length);
            } else {
              setLightboxIdx((lightboxIdx + 1) % filtered.length);
            }
          }}
        >
          <button
            type="button"
            aria-label="Zavrieť"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-6 right-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-colors z-10"
            style={{ touchAction: "manipulation" }}
          >
            <X className="w-6 h-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Predchádzajúca"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length); }}
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-14 h-14 md:w-12 md:h-12 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-colors z-10"
            style={{ touchAction: "manipulation" }}
          >
            <ChevronLeft className="w-7 h-7 md:w-6 md:h-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Ďalšia"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % filtered.length); }}
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-14 h-14 md:w-12 md:h-12 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-colors z-10"
            style={{ touchAction: "manipulation" }}
          >
            <ChevronRight className="w-7 h-7 md:w-6 md:h-6" aria-hidden />
          </button>
          <div
            className="relative max-w-6xl w-full max-h-[85vh] aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filtered[lightboxIdx].src}
              alt={filtered[lightboxIdx].alt}
              fill
              sizes="100vw"
              quality={92}
              className="object-contain"
              priority
            />
          </div>
          {/* Pager + swipe hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium z-10 pointer-events-none">
            {lightboxIdx + 1} / {filtered.length} <span className="md:hidden ml-2 opacity-60">← swipe →</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterRowProps {
  label: string;
  active: string;
  options: { value: string; label: string; shortLabel?: string }[];
  onChange: (value: string) => void;
}

function FilterRow({ label, active, options, onChange }: FilterRowProps) {
  return (
    <div className="relative z-10">
      <div className="text-[11px] md:text-base font-bold uppercase tracking-[0.16em] md:tracking-[0.18em] text-white mb-1.5 md:mb-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-1 md:gap-2 -mx-2 md:mx-0">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(opt.value);
            }}
            style={{ touchAction: "manipulation" }}
            className={cn(
              "whitespace-nowrap min-h-[52px] md:min-h-[44px] px-1.5 md:px-5 py-3.5 md:py-2.5 rounded-full text-[11px] md:text-base font-semibold transition-all duration-300 select-none cursor-pointer",
              active === opt.value
                ? "bg-[var(--color-fg)] text-white shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
                : "bg-white text-[var(--color-fg)] hover:bg-white/90 active:bg-white/80",
            )}
            aria-pressed={active === opt.value}
          >
            {opt.shortLabel ? (
              <>
                <span className="md:hidden">{opt.shortLabel}</span>
                <span className="hidden md:inline">{opt.label}</span>
              </>
            ) : (
              opt.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
