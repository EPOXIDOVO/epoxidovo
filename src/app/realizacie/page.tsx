import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { GalleryView } from "@/components/realizacie/GalleryView";
import { CATEGORIES, SPACE_TYPES } from "@/content/categories";

export const metadata: Metadata = {
  title: "Realizácie — naše práce",
  description:
    "Prehliadnite si fotky našich realizácií. Filtruj podľa typu priestoru (dom, garáž, hala) alebo kategórie podlahy (jednofarebné, chipsové, mramorové, metalické).",
  alternates: { canonical: "/realizacie" },
};

export default function RealizaciePage() {
  return (
    <div className="bg-[var(--color-copper)] text-white realizacie-theme">
      <Section tone="default" size="md" className="!bg-transparent !text-white pt-28 md:pt-32">
        <Container size="xl">
          <div className="max-w-3xl md:max-w-none">
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-white">
              ● Naše práce
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white md:whitespace-nowrap">
              Realizácie{" "}
              <span className="text-[#3db6e8]">po celom Slovensku</span>.
            </h1>
          </div>
        </Container>
      </Section>

      <Section tone="default" size="md" className="!bg-transparent !text-white !pt-0">
        <Container size="xl">
          {/* Grafická bublina — popis nad filtrami s chvostíkom smerujúcim dolu na filter chips */}
          <div className="relative inline-block max-w-md md:max-w-xl mb-8 md:mb-10">
            <div className="bg-white text-[var(--color-fg)] rounded-2xl px-5 md:px-6 py-4 md:py-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
              <p className="text-base md:text-lg leading-snug font-medium">
                Filtruj podľa typu priestoru alebo kategórie podlahy. Klikni na
                fotku pre detail.
              </p>
            </div>
            <svg
              className="absolute -bottom-[11px] left-10 md:left-14 w-7 h-3.5 drop-shadow-[0_4px_4px_rgba(0,0,0,0.08)]"
              viewBox="0 0 28 14"
              aria-hidden
            >
              <polygon points="0,0 28,0 14,14" fill="white" />
            </svg>
          </div>

          <Suspense
            fallback={
              <div className="py-20 text-center text-white/70 text-sm">
                Načítavam galériu…
              </div>
            }
          >
            <GalleryView categories={CATEGORIES} spaceTypes={SPACE_TYPES} />
          </Suspense>
        </Container>
      </Section>
    </div>
  );
}
