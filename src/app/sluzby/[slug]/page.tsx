import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { CATEGORIES } from "@/content/categories";
import { SERVICE_DETAILS } from "@/content/serviceDetails";
import { SITE } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld-safe";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const detail = SERVICE_DETAILS[slug];
  if (!cat || !detail) return {};
  return {
    title: `${cat.name} epoxidové podlahy`,
    description: detail.intro,
    alternates: { canonical: `/sluzby/${slug}` },
    openGraph: {
      title: `${cat.name} epoxidové podlahy — EPOXIDOVO`,
      description: detail.intro,
    },
  };
}

export default async function SluzbaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const detail = SERVICE_DETAILS[slug];
  if (!cat || !detail) notFound();

  // Prechody na susedné kategórie pre cross-navigation
  const idx = CATEGORIES.findIndex((c) => c.slug === slug);
  const prev = CATEGORIES[(idx - 1 + CATEGORIES.length) % CATEGORIES.length];
  const next = CATEGORIES[(idx + 1) % CATEGORIES.length];

  // Service JSON-LD — každá kategória ako samostatná služba s providerom
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE.url}/sluzby/${slug}/#service`,
    serviceType: `${cat.name} epoxidová podlaha`,
    name: `${cat.name} epoxidové podlahy`,
    description: detail.intro,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${SITE.url}/#business`,
      name: SITE.legalName,
      url: SITE.url,
    },
    areaServed: { "@type": "Country", name: "Slovensko" },
    url: `${SITE.url}/sluzby/${slug}`,
    category: "Stavebné práce — podlahy",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "EUR",
        description: "Cena podľa rozsahu a typu povrchu — bezplatná kalkulácia",
      },
    },
  };

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Služby", path: "/sluzby" },
          { name: cat.name, path: `/sluzby/${slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceSchema) }}
      />
      {/* Hero */}
      <Section tone="ink" size="lg">
        <Container size="xl">
          <Link
            href="/sluzby"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-3 h-3 rotate-180" aria-hidden />
            Všetky služby
          </Link>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-brand-soft)]">
                {cat.tagline}
              </p>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-white">
                {cat.name}
                <br />
                <span className="italic font-light text-[var(--color-brand-soft)]">
                  podlahy.
                </span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-zinc-300 max-w-2xl leading-relaxed">
                {detail.intro}
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Orientačná cena
              </div>
              <div className="mt-2 text-4xl md:text-5xl font-bold text-white">
                {detail.priceRange}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Presná cena po obhliadke
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Hero image placeholder */}
      <div className="aspect-[16/8] md:aspect-[21/8] bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500" />

      {/* Detail blocks */}
      <Section tone="default" size="md">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              {detail.longDescription.map((p, i) => (
                <p
                  key={i}
                  className="text-base md:text-lg text-[var(--color-fg)] leading-relaxed mb-5 last:mb-0"
                >
                  {p}
                </p>
              ))}

              <h2 className="mt-12 text-2xl md:text-3xl font-bold tracking-tight">
                Vlastnosti
              </h2>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detail.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm md:text-base text-[var(--color-fg)]"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-brand)] text-white shrink-0 mt-0.5">
                      <Check className="w-3 h-3" aria-hidden />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar — technicke specy + bestFor */}
            <aside className="lg:col-span-5">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-2xl border border-[var(--color-border)] p-6 md:p-8 bg-[var(--color-bg-soft)]">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-fg-subtle)]">
                    Technické parametre
                  </h3>
                  <dl className="mt-5 space-y-4">
                    {detail.technicalSpecs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)] last:border-b-0 last:pb-0"
                      >
                        <dt className="text-sm text-[var(--color-fg-muted)]">
                          {spec.label}
                        </dt>
                        <dd className="text-sm font-semibold tabular-nums">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] p-6 md:p-8">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-fg-subtle)]">
                    Najlepšie sa hodí pre
                  </h3>
                  <ul className="mt-5 space-y-2.5">
                    {detail.bestFor.map((b) => (
                      <li
                        key={b}
                        className="text-sm text-[var(--color-fg)] flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  href={`/kontakt?sluzba=${cat.slug}`}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Cenová ponuka
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Button>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Cross-nav */}
      <Section tone="muted" size="sm">
        <Container size="xl">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <Link
              href={`/sluzby/${prev.slug}`}
              className="group rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-fg)] p-6 md:p-8 transition-colors bg-white"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-fg-subtle)]">
                ← Predchádzajúca
              </span>
              <h4 className="mt-2 text-xl md:text-2xl font-bold tracking-tight group-hover:text-[var(--color-brand)] transition-colors">
                {prev.name}
              </h4>
            </Link>
            <Link
              href={`/sluzby/${next.slug}`}
              className="group rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-fg)] p-6 md:p-8 transition-colors bg-white text-right"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-fg-subtle)]">
                Nasledujúca →
              </span>
              <h4 className="mt-2 text-xl md:text-2xl font-bold tracking-tight group-hover:text-[var(--color-brand)] transition-colors">
                {next.name}
              </h4>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
