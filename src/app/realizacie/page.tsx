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
import { safeJsonLd } from "@/lib/json-ld-safe";

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
    "Prehliadnite si fotky našich realizácií. Filtruj podľa typu priestoru (dom, garáž, hala) alebo kategórie podlahy (jednofarebné, chipsové, metalické).",
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
          __html: safeJsonLd(itemListSchema),
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
        <Container size="xl" className="pt-[64px] md:pt-[96px] pb-2 md:pb-5 relative z-10">
          <div className="text-center text-white">
            <div className="inline-block px-4 md:px-10 py-2 md:py-4 rounded-2xl md:rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight md:whitespace-nowrap">
                Realizujeme{" "}
                <span className="text-[#3db6e8]">po celom </span>
                <span
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    // Viac bielej (40%) aby to nevyzeralo ako ruská vlajka;
                    // slovenská má opticky výraznejší vrchný biely pás.
                    backgroundImage:
                      "linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 40%, #0B4EA2 40%, #0B4EA2 70%, #EE1C25 70%, #EE1C25 100%)",
                    // 4-smerný drop-shadow simuluje čistý outline BEZ artefaktov
                    // vnútri písmen (na rozdiel od -webkit-text-stroke, ktorý sa
                    // pri background-clip: text renderuje aj vnútri masky).
                    // Posledný shadow = soft glow pre depth na svetlom pozadí.
                    filter:
                      "drop-shadow(1px 0 0 #0a0f1e) drop-shadow(-1px 0 0 #0a0f1e) drop-shadow(0 1px 0 #0a0f1e) drop-shadow(0 -1px 0 #0a0f1e) drop-shadow(0 3px 8px rgba(0,0,0,0.75))",
                  }}
                >
                  Slovensku
                </span>
              </h1>
            </div>
            <nav
              aria-label="Breadcrumb"
              className="mt-3 md:mt-6 text-[17px] md:text-lg text-white/90 font-semibold"
            >
              <ol className="inline-flex items-center gap-1.5 md:gap-2.5">
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

      <Section tone="default" size="md" className="!bg-transparent !text-white max-md:!py-4">
        <Container size="xl">
          <div className="relative">
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
