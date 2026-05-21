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
          <div className="max-w-3xl">
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-white">
              ● Naše práce
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Realizácie po celom Slovensku.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white leading-relaxed font-medium">
              Filtruj podľa typu priestoru alebo kategórie podlahy. Klikni na
              fotku pre detail — väčšina realizácií má aj video.
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="default" size="md" className="!bg-transparent !text-white !pt-0">
        <Container size="xl">
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
