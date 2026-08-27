"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Category, SpaceType } from "@/content/categories";
import { REALIZACIE } from "@/content/realizacie";
import { NahladPodlahyProvider, useNahladPodlahy } from "@/components/home/NahladPodlahy";
import type { FotkaPodlahy } from "@/content/typ-podlahy";

interface GalleryViewProps {
  categories: Category[];
  spaceTypes: SpaceType[];
}

/**
 * Klient-side galéria s filtrovaním cez URL params.
 * URL: /realizacie?kategoria=jednofarebne&priestor=dom
 */
export function GalleryView(props: GalleryViewProps) {
  return (
    <NahladPodlahyProvider>
      <GalleryViewInner {...props} />
    </NahladPodlahyProvider>
  );
}

function GalleryViewInner({ categories, spaceTypes }: GalleryViewProps) {
  const router = useRouter();
  const params = useSearchParams();
  const activeCategory = params.get("kategoria") || "all";
  const activeSpace = params.get("priestor") || "all";
  const { otvor } = useNahladPodlahy();

  /**
   * Galéria otvára TEN ISTÝ náhľad ako fotky na homepage — user 2026-08-25:
   * „chcem aby sa vsetky tie fotky zobrazovali rovnako … s tymi popismi
   * a kupit material". Predtým tu bol holý lightbox bez popisu aj bez
   * cesty ďalej (vizualizér, cenová ponuka).
   */
  const otvorNahlad = (i: number) => {
    const fotky: FotkaPodlahy[] = filtered.map((r) => ({
      src: r.src,
      typ: r.typ,
      alt: r.alt,
      farba: r.farba,
      farbaLabel: r.farba,
    }));
    otvor(fotky, i, null);
  };



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
              onClick={() => otvorNahlad(i)}
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
              "whitespace-nowrap min-h-[52px] md:min-h-[44px] px-1.5 md:px-5 py-3.5 md:py-2.5 rounded-full text-[11px] md:text-base transition-all duration-300 select-none cursor-pointer",
              // Hover „od stredu ku krajom" (user 2026-08-27): pod textom leží
              // modrá pilulka `::before`, ktorá sa z scale-0 v strede rozvinie
              // na celé tlačidlo. `isolate` + `before:-z-10` ju kreslí NAD
              // vlastným pozadím tlačidla, ale POD textom — netreba obaľovať
              // deti. `overflow-hidden` drží prechod v rounded-full tvare.
              "relative isolate overflow-hidden",
              "before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-[#3db6e8]",
              "before:origin-center before:scale-0 before:transition-transform before:duration-[450ms] before:ease-[cubic-bezier(0.16,1,0.3,1)]",
              active === opt.value
                // ACTIVE pill: bright "logo blue" #3db6e8 + white bold text
                // na obidvoch (mobile + desktop) — user explicit request.
                // Aktívna je modrá natvrdo, hover efekt netreba → before skrytý.
                ? "bg-[#3db6e8] text-white font-extrabold shadow-[0_6px_18px_rgba(61,182,232,0.35)] before:hidden"
                // INACTIVE: biela; hover rozvinie modrú od stredu a text zbelie.
                : "bg-white text-[var(--color-fg)] font-semibold hover:text-white hover:before:scale-100 active:bg-white/80",
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
