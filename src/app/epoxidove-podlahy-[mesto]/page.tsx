import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CategoriesShowcase } from "@/components/home/CategoriesShowcase";
import { Reviews } from "@/components/home/Reviews";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Stats } from "@/components/home/Stats";
import { CITIES, findCity } from "@/content/cities";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { SITE } from "@/lib/site";

const MARQUEE_PHOTOS = [
  "/images/realizacie/r-35.jpg",
  "/images/realizacie/r-32.jpg",
  "/images/realizacie/r-33.jpg",
  "/images/realizacie/r-11.jpg",
];

interface RouteContext {
  params: Promise<{ mesto: string }>;
}

// Static generation pre všetky mestá — pre-render pri build-e
export function generateStaticParams() {
  return CITIES.map((c) => ({ mesto: c.slug }));
}

export async function generateMetadata({ params }: RouteContext): Promise<Metadata> {
  const { mesto } = await params;
  const city = findCity(mesto);
  if (!city) return {};

  const title = `Epoxidové podlahy ${city.inCity} | Cenová ponuka zdarma`;
  const description = `Profesionálne liate epoxidové a polyuretánové podlahy ${city.inCity} a okolí (${city.surroundings.slice(0, 3).join(", ")}…). Jednofarebné, chipsové, mramorové, metalické. 200+ realizácií, 20+ rokov životnosť. Bezplatná obhliadka a cenová ponuka.`;

  return {
    title,
    description,
    keywords: [
      `epoxidové podlahy ${city.name}`,
      `epoxidová podlaha ${city.name}`,
      `liate podlahy ${city.name}`,
      `polyuretánové podlahy ${city.name}`,
      `epoxid ${city.name}`,
      `podlahár ${city.name}`,
      `garážové podlahy ${city.name}`,
      `priemyselné podlahy ${city.name}`,
    ],
    alternates: { canonical: `/epoxidove-podlahy-${city.slug}` },
    openGraph: {
      type: "website",
      locale: "sk_SK",
      url: `${SITE.url}/epoxidove-podlahy-${city.slug}`,
      siteName: "EPOXIDOVO",
      title,
      description,
      // OG image sa generuje dynamicky cez opengraph-image.tsx v tomto routte
      // (s názvom mesta) — Next.js to auto-detekuje, nemusíme tu špecifikovať.
    },
  };
}

export default async function CityPage({ params }: RouteContext) {
  const { mesto } = await params;
  const city = findCity(mesto);
  if (!city) notFound();

  // LocalBusiness JSON-LD s areaServed = konkrétne mesto
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE.url}/epoxidove-podlahy-${city.slug}/#business`,
    name: `${SITE.legalName} — Epoxidové podlahy ${city.inCity}`,
    description: `Realizácie epoxidových a polyuretánových podláh ${city.inCity} a okolí.`,
    url: `${SITE.url}/epoxidove-podlahy-${city.slug}`,
    telephone: SITE.contact.phone,
    email: SITE.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.countryCode,
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: city.region,
      },
    },
    priceRange: "€€",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          {
            name: `Epoxidové podlahy ${city.name}`,
            path: `/epoxidove-podlahy-${city.slug}`,
          },
        ]}
      />

      {/* Hero — marquee + tmavý overlay + bublina s nadpisom mesta */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex w-max animate-stats-marquee"
        >
          {[...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS].map(
            (src, i) => (
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
            ),
          )}
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
        <Container
          size="xl"
          className="pt-[120px] md:pt-[140px] pb-12 md:pb-16 relative z-10"
        >
          <div className="text-center text-white">
            <div className="inline-block px-6 md:px-12 py-5 md:py-7 rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Epoxidové podlahy
                <br />
                <span className="text-[#3db6e8]">{city.inCity}</span>
              </h1>
            </div>
            <p className="mt-5 md:mt-6 text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
              Profesionálne liate epoxidové a polyuretánové podlahy{" "}
              {city.inCity} a okolí. Bezplatná obhliadka a cenová ponuka do 24
              hodín.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/cenova-ponuka"
                className="btn btn-primary btn-lg max-md:!px-4 max-md:!py-2.5 max-md:!text-[13px]"
              >
                Cenová ponuka zdarma
              </Link>
              <Link
                href={`tel:${SITE.contact.phoneRaw}`}
                className="btn btn-outline btn-lg max-md:!px-4 max-md:!py-2.5 max-md:!text-[13px]"
              >
                Zavolaj {SITE.contact.phone}
              </Link>
            </div>
            <nav
              aria-label="Breadcrumb"
              className="mt-7 text-sm md:text-base text-white/80"
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
                <li className="text-white/40" aria-hidden>
                  /
                </li>
                <li className="text-[#3db6e8] font-semibold">{city.name}</li>
              </ol>
            </nav>
          </div>
        </Container>
      </section>

      {/* Lokálna sekcia — copy o danom meste */}
      <Section
        tone="default"
        size="md"
        className="bg-[var(--color-copper)] !text-white"
      >
        <Container size="xl" className="py-10 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[0.7rem] md:text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-white"
                aria-hidden
              />
              {city.region}
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
              Realizujeme epoxidové podlahy{" "}
              <span className="text-[#3db6e8]">{city.inCity}</span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-white/95 leading-relaxed">
              EPOXIDOVO s. r. o. dodáva ručne tvorené epoxidové a polyuretánové
              podlahy do domácností, garáží, dielní, prevádzok a priemyselných
              hál {city.inCity} a okolí — vrátane miest{" "}
              <strong>{city.surroundings.slice(0, 4).join(", ")}</strong>. Naše
              sídlo je v Ružomberku ({city.distance}
              {city.slug === "ruzomberok" ? "" : ` od ${city.name}`}), ale
              realizácie robíme po celom Slovensku.
            </p>
            <p className="mt-4 text-base md:text-lg text-white/90 leading-relaxed">
              V ponuke máme <strong>jednofarebné</strong>,{" "}
              <strong>chipsové</strong>, <strong>mramorové</strong> a{" "}
              <strong>metalické</strong> epoxidové podlahy. Pre priemysel{" "}
              {city.inCity}{" "}
              poskytujeme certifikované riešenia — <strong>ATEX</strong>,{" "}
              <strong>ESD</strong>, <strong>protišmyk R9–R13</strong> a{" "}
              <strong>HACCP</strong>. Každá podlaha má životnosť 20+ rokov,
              bezšpárový povrch a ľahkú údržbu.
            </p>

            <div className="mt-8">
              <Link
                href="/cenova-ponuka"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#f97316] text-white font-bold hover:bg-[#ea580c] shadow-[0_10px_30px_rgba(249,115,22,0.5)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.65)] transition-all duration-300"
              >
                Cenová ponuka pre {city.name} →
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Reuse hlavných sekcií homepage (rovnaký dizajn aj komponenty) */}
      <Stats />
      <CategoriesShowcase />
      <HowItWorks />
      <Reviews />

      {/* Final CTA s názvom mesta */}
      <Section tone="default" size="md" className="bg-[#0e1320] !text-white">
        <Container size="md" className="py-14 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Plánuješ podlahu {city.inCity}?
          </h2>
          <p className="mt-5 text-base md:text-lg text-white/85 leading-relaxed max-w-xl mx-auto">
            Vyplň formulár a do 24 hodín ti pošleme cenovú kalkuláciu na mieru.
            Obhliadka {city.inCity} a okolí zdarma.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/cenova-ponuka"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#f97316] text-white font-bold hover:bg-[#ea580c] shadow-[0_10px_30px_rgba(249,115,22,0.5)] transition-all duration-300"
            >
              Cenová ponuka zdarma
            </Link>
            <Link
              href={`tel:${SITE.contact.phoneRaw}`}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#16a34a] text-white font-bold hover:bg-[#15803d] shadow-[0_10px_30px_rgba(22,163,74,0.4)] transition-all duration-300"
            >
              {SITE.contact.phone}
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
