"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, MapPin, Ruler, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PROJECTS,
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategory,
} from "@/content/projects";

/**
 * Galéria realizácií — kartový pohľad s metadátami a lightboxom.
 * URL filter: /realizacie?kategoria=mramorove
 *
 * Karta: hlavná fotka + title + lokalita + typ + plocha + rok + popis
 * Lightbox: šípky pre prechádzanie viacerých fotiek jednej realizácie.
 */
export function ProjectsView() {
  const router = useRouter();
  const params = useSearchParams();
  const activeCategory = (params.get("kategoria") || "all") as ProjectCategory | "all";

  const [lightbox, setLightbox] = React.useState<{ projectId: string; photoIdx: number } | null>(null);

  const setFilter = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete("kategoria");
    else next.set("kategoria", value);
    router.replace(`/realizacie${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
  };

  const filtered = React.useMemo(
    () =>
      PROJECTS.filter((p) => activeCategory === "all" || p.category === activeCategory),
    [activeCategory],
  );

  const lightboxProject: Project | null =
    lightbox ? PROJECTS.find((p) => p.id === lightbox.projectId) ?? null : null;

  React.useEffect(() => {
    if (!lightbox || !lightboxProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      const total = lightboxProject.photos.length;
      if (e.key === "ArrowLeft")
        setLightbox((l) =>
          l ? { ...l, photoIdx: (l.photoIdx - 1 + total) % total } : l,
        );
      if (e.key === "ArrowRight")
        setLightbox((l) => (l ? { ...l, photoIdx: (l.photoIdx + 1) % total } : l));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, lightboxProject]);

  const categoryLabel = (slug: ProjectCategory) =>
    PROJECT_CATEGORIES.find((c) => c.value === slug)?.label ?? slug;

  return (
    <div>
      {/* Filter */}
      <div className="mb-8">
        <div className="text-sm md:text-base font-bold uppercase tracking-[0.18em] text-white mb-3">
          Typ podlahy
        </div>
        <div className="flex flex-wrap gap-2">
          {PROJECT_CATEGORIES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={cn(
                "px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm md:text-base font-semibold transition-all duration-300",
                activeCategory === opt.value
                  ? "bg-[var(--color-fg)] text-white shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
                  : "bg-white text-[var(--color-fg)] hover:bg-white/90",
              )}
              aria-pressed={activeCategory === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
            Pre túto kategóriu zatiaľ nemáme realizácie. Skús zmeniť filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filtered.map((project) => (
            <article
              key={project.id}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white text-[var(--color-fg)] shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.28)] transition-shadow duration-500"
            >
              {/* Cover photo — klik otvorí lightbox */}
              <button
                type="button"
                onClick={() => setLightbox({ projectId: project.id, photoIdx: 0 })}
                className="relative block aspect-[4/3] overflow-hidden bg-black/10"
                aria-label={`Otvoriť galériu: ${project.title}`}
              >
                <Image
                  src={project.photos[0]}
                  alt={`${project.title} — ${project.location}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {project.photos.length > 1 && (
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-semibold backdrop-blur-sm">
                    +{project.photos.length - 1} fotiek
                  </span>
                )}
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f97316] text-white text-[10px] md:text-[11px] font-black uppercase tracking-wider">
                  {categoryLabel(project.category)}
                </span>
              </button>

              {/* Metadáta */}
              <div className="p-3 md:p-5 flex flex-col gap-1.5 md:gap-2">
                <h3 className="text-sm md:text-lg font-bold leading-tight tracking-tight">
                  {project.title}
                </h3>
                <div className="flex items-center gap-1 text-xs md:text-sm text-[var(--color-fg-muted)]">
                  <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" aria-hidden />
                  <span>{project.location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-[var(--color-fg-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Ruler className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" aria-hidden />
                    {project.area} m²
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" aria-hidden />
                    {project.year}
                  </span>
                </div>
                {project.description && (
                  <p className="hidden md:block mt-1 text-xs md:text-sm text-[var(--color-fg-muted)] leading-snug line-clamp-3">
                    {project.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && lightboxProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galéria: ${lightboxProject.title}`}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-3 md:p-6"
          onClick={() => setLightbox(null)}
        >
          {/* Zatvoriť */}
          <button
            type="button"
            aria-label="Zavrieť"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>

          {/* Šípky */}
          {lightboxProject.photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Predchádzajúca fotka"
                onClick={(e) => {
                  e.stopPropagation();
                  const total = lightboxProject.photos.length;
                  setLightbox((l) =>
                    l ? { ...l, photoIdx: (l.photoIdx - 1 + total) % total } : l,
                  );
                }}
                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Ďalšia fotka"
                onClick={(e) => {
                  e.stopPropagation();
                  const total = lightboxProject.photos.length;
                  setLightbox((l) =>
                    l ? { ...l, photoIdx: (l.photoIdx + 1) % total } : l,
                  );
                }}
                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" aria-hidden />
              </button>
            </>
          )}

          {/* Image + meta */}
          <div
            className="relative max-w-6xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[4/3] max-h-[75vh]">
              <Image
                src={lightboxProject.photos[lightbox.photoIdx]}
                alt={`${lightboxProject.title} — fotka ${lightbox.photoIdx + 1}`}
                fill
                sizes="100vw"
                quality={92}
                className="object-contain"
                priority
              />
            </div>
            {/* Caption pod fotkou */}
            <div className="mt-4 md:mt-5 text-center text-white max-w-2xl px-2">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs md:text-sm font-semibold uppercase tracking-wider text-[#3db6e8]">
                <span>{categoryLabel(lightboxProject.category)}</span>
                <span className="text-white/40">•</span>
                <span>{lightboxProject.location}</span>
                <span className="text-white/40">•</span>
                <span>{lightboxProject.area} m²</span>
                <span className="text-white/40">•</span>
                <span>{lightboxProject.year}</span>
              </div>
              <h2 className="mt-2 text-xl md:text-2xl font-bold">
                {lightboxProject.title}
              </h2>
              {lightboxProject.description && (
                <p className="mt-2 text-sm md:text-base text-white/80 leading-relaxed">
                  {lightboxProject.description}
                </p>
              )}
              {lightboxProject.photos.length > 1 && (
                <p className="mt-3 text-xs md:text-sm text-white/60">
                  Fotka {lightbox.photoIdx + 1} / {lightboxProject.photos.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
