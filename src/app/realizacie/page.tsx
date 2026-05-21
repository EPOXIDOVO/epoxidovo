import type { Metadata } from "next";
import Link from "next/link";
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
      {/* Dark hero — rovnaký formát ako /kontakt: bublina + breadcrumb */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e]">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-full"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(61,182,232,0.22), transparent 75%)",
            }}
          />
        </div>
        <Container size="xl" className="pt-[120px] md:pt-[140px] pb-10 md:pb-14 relative">
          <div className="text-center text-white">
            <div className="inline-block px-8 md:px-14 py-5 md:py-7 rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight md:whitespace-nowrap">
                Realizujeme{" "}
                <span className="text-[#3db6e8]">po celom Slovensku</span>
              </h1>
            </div>
            <nav
              aria-label="Breadcrumb"
              className="mt-5 md:mt-6 text-base md:text-lg text-white/90"
            >
              <ol className="inline-flex items-center gap-2.5">
                <li>
                  <Link
                    href="/"
                    className="hover:text-[#3db6e8] transition-colors"
                  >
                    Domovská stránka
                  </Link>
                </li>
                <li className="text-white/40" aria-hidden>/</li>
                <li>
                  <Link
                    href="/kontakt"
                    className="text-[#3db6e8] hover:text-white transition-colors font-semibold"
                  >
                    Kontaktujte nás
                  </Link>
                </li>
              </ol>
            </nav>
          </div>
        </Container>
      </section>

      <Section tone="default" size="md" className="!bg-transparent !text-white">
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
