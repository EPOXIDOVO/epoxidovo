import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { GalleryView } from "@/components/realizacie/GalleryView";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { CATEGORIES, SPACE_TYPES } from "@/content/categories";
import { REALIZACIE } from "@/content/realizacie";
import { SITE } from "@/lib/site";

const MARQUEE_PHOTOS = [
  "/images/realizacie/r-19.jpg",
  "/images/realizacie/r-35.jpg",
  "/images/realizacie/r-32.jpg",
  "/images/realizacie/r-37.webp",
  "/images/realizacie/r-40.jpg",
];

export const metadata: Metadata = {
  title: "Realizácie — naše práce",
  description:
    "Prehliadnite si fotky našich realizácií. Filtruj podľa typu priestoru (dom, garáž, hala) alebo kategórie podlahy (jednofarebné, chipsové, mramorové, metalické).",
  alternates: { canonical: "/realizacie" },
};

export default function RealizaciePage() {
  // ItemList JSON-LD schema — pomáha Google Images discover-ovať realizácie
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE.url}/realizacie/#itemlist`,
    name: "Realizácie epoxidových podláh — EPOXIDOVO",
    description:
      "Fotogaléria realizovaných epoxidových a polyuretánových podláh — domy, garáže, priemyselné haly.",
    numberOfItems: REALIZACIE.length,
    itemListElement: REALIZACIE.slice(0, 50).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "ImageObject",
        "@id": `${SITE.url}/realizacie/#r-${r.id}`,
        contentUrl: `${SITE.url}${r.src}`,
        url: `${SITE.url}${r.src}`,
        name: r.alt,
        description: r.alt,
        creditText: SITE.legalName,
        creator: {
          "@type": "Organization",
          name: SITE.legalName,
          url: SITE.url,
        },
        copyrightNotice: `© ${new Date().getFullYear()} ${SITE.legalName}`,
        license: `${SITE.url}/podmienky`,
        acquireLicensePage: `${SITE.url}/kontakt`,
      },
    })),
  };

  return (
    <div className="bg-[var(--color-copper)] text-white realizacie-theme">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Realizácie", path: "/realizacie" },
        ]}
      />
      {/* Dark hero — rovnaký formát ako /kontakt: marquee fotiek + overlay + bublina */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex w-max animate-stats-marquee"
        >
          {[...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS].map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-full w-[60vw] md:w-[32vw] lg:w-[24vw] shrink-0"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 60vw, 32vw"
                className="object-cover"
                priority={i < 3}
              />
            </div>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(61,182,232,0.18), transparent 75%)",
          }}
        />
        <Container size="xl" className="pt-[120px] md:pt-[140px] pb-10 md:pb-14 relative z-10">
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
          <div className="relative">
            {/* Mobile bublina — nad filtrami (tail dole) */}
            <div className="md:hidden relative inline-block max-w-md mb-6">
              <div className="bg-white text-[var(--color-fg)] rounded-2xl px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
                <p className="text-base leading-snug font-medium">
                  Filtruj podľa{" "}
                  <span className="text-[#3db6e8] font-semibold">typu priestoru</span>{" "}
                  alebo{" "}
                  <span className="text-[#3db6e8] font-semibold">vzoru podlahy</span>
                  . Klikni na fotku pre detail.
                </p>
              </div>
              <svg
                className="absolute -bottom-[11px] left-10 w-7 h-3.5 drop-shadow-[0_4px_4px_rgba(0,0,0,0.08)]"
                viewBox="0 0 28 14"
                aria-hidden
              >
                <polygon points="0,0 28,0 14,14" fill="white" />
              </svg>
            </div>

            {/* Desktop bublina — absolute na pravej strane (preč od chips),
                tail diagonálne smerom vľavo-dole na chip area. */}
            <div className="hidden md:block absolute top-0 right-[22%] lg:right-[26%] w-[240px] lg:w-[260px] z-20">
              <div className="relative bg-white text-[var(--color-fg)] rounded-2xl px-5 py-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.22)] ring-1 ring-black/5">
                <p className="text-sm leading-snug font-medium">
                  Filtruj podľa{" "}
                  <span className="text-[#3db6e8] font-semibold">typu priestoru</span>{" "}
                  alebo{" "}
                  <span className="text-[#3db6e8] font-semibold">vzoru podlahy</span>
                  . Klikni na fotku pre detail.
                </p>
                {/* Tail — z bottom-left, krátky diagonál smerom dole-vľavo */}
                <svg
                  className="absolute -bottom-3 left-6 w-7 h-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)]"
                  viewBox="0 0 28 16"
                  aria-hidden
                >
                  <polygon points="0,0 28,0 0,16" fill="white" />
                </svg>
              </div>
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
          </div>
        </Container>
      </Section>
    </div>
  );
}
