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
    // Reset kategoria if new priestor restricts it
    if (key === "priestor") {
      const cat = next.get("kategoria");
      if (cat) {
        if (value === "hala-firma" && cat !== "jednofarebne") next.delete("kategoria");
        if (value === "dom" && cat === "chipsove") next.delete("kategoria");
      }
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
      <div className="space-y-4 mb-10">
        <FilterRow
          label="Typ priestoru"
          active={activeSpace}
          onChange={(v) => setFilter("priestor", v)}
          options={[
            { value: "all", label: "Všetky priestory" },
            ...spaceTypes.map((s) => ({ value: s.slug, label: s.name })),
          ]}
        />
        <FilterRow
          label="Kategória podlahy"
          active={activeCategory}
          onChange={(v) => setFilter("kategoria", v)}
          options={[
            { value: "all", label: "Všetky kategórie" },
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

      <p className="text-base md:text-lg font-semibold text-white mb-6">
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
        >
          <button
            type="button"
            aria-label="Zavrieť"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-6 right-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Predchádzajúca"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Ďalšia"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % filtered.length); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" aria-hidden />
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
        </div>
      )}
    </div>
  );
}

interface FilterRowProps {
  label: string;
  active: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterRow({ label, active, options, onChange }: FilterRowProps) {
  return (
    <div>
      <div className="text-sm md:text-base font-bold uppercase tracking-[0.18em] text-white mb-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-5 py-2.5 rounded-full text-base font-semibold transition-all duration-300",
              active === opt.value
                ? "bg-[var(--color-fg)] text-white shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
                : "bg-white text-[var(--color-fg)] hover:bg-white/90",
            )}
            aria-pressed={active === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
