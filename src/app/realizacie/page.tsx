import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ProjectsView } from "@/components/realizacie/ProjectsView";

export const metadata: Metadata = {
  title: "Realizácie — naše práce",
  description:
    "Prehliadnite si fotky našich realizácií. Filtruj podľa kategórie podlahy (jednofarebné, chipsové, mramorové, metalické, priemyselné).",
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
              Pozri si výber našich projektov. Filtruj podľa typu podlahy,
              klikni na kartu pre detail a viac fotiek.
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
            <ProjectsView />
          </Suspense>
        </Container>
      </Section>
    </div>
  );
}
