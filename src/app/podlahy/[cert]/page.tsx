import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import {
  CERTIFICATIONS,
  CERT_LIST,
  type CertSlug,
} from "@/content/certifications";
import { SITE } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld-safe";

interface PageProps {
  params: Promise<{ cert: string }>;
}

export function generateStaticParams() {
  return CERT_LIST.map((cert) => ({ cert }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { cert } = await params;
  const data = CERTIFICATIONS[cert as CertSlug];
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `/podlahy/${cert}` },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: "article",
    },
  };
}

export default async function CertificationPage({ params }: PageProps) {
  const { cert } = await params;
  const data = CERTIFICATIONS[cert as CertSlug];
  if (!data) notFound();

  // FAQ JSON-LD pre Google rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE.url}/podlahy/${cert}/#faq`,
    mainEntity: data.faq.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  // Service JSON-LD — každá certifikácia ako samostatná služba
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE.url}/podlahy/${cert}/#service`,
    serviceType: `${data.shortName} certifikovaná epoxidová podlaha`,
    name: data.h1,
    description: data.metaDescription,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${SITE.url}/#business`,
      name: SITE.legalName,
      url: SITE.url,
    },
    areaServed: { "@type": "Country", name: "Slovensko" },
    url: `${SITE.url}/podlahy/${cert}`,
    category: "Priemyselné epoxidové podlahy — certifikované systémy",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "EUR",
        price: data.priceFrom,
        description: `Cena od ${data.priceFrom} €/m². ${data.priceNote}`,
      },
    },
  };

  const related = data.relatedCerts.map((slug) => CERTIFICATIONS[slug]);

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Certifikované podlahy", path: "/podlahy" },
          { name: data.shortName, path: `/podlahy/${cert}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceSchema) }}
      />

      {/* ═══ HERO ═══ */}
      <section
        className="relative isolate overflow-hidden bg-[#0a0f1e] text-white"
        style={{
          backgroundImage: `radial-gradient(80% 60% at 50% 0%, ${data.accent}30, transparent 70%)`,
        }}
      >
        <Container size="xl" className="pt-24 md:pt-32 pb-16 md:pb-24 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
          >
            <ArrowRight className="w-3 h-3 rotate-180" aria-hidden />
            Domov
          </Link>

          <div className="mt-6 max-w-4xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
              style={{
                background: `${data.accent}25`,
                border: `1px solid ${data.accent}80`,
                color: data.accent,
              }}
            >
              <span className="text-lg">{data.emoji}</span>
              <span>{data.shortName} certifikované</span>
            </div>
            <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              {data.h1}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/85 leading-relaxed max-w-3xl">
              {data.heroTagline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/cenova-ponuka"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0a0f1e] font-bold hover:bg-white/90 transition-colors"
              >
                Nezáväzná cenová ponuka
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`tel:${SITE.contact.phoneRaw}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {SITE.contact.phone}
              </a>
            </div>

            {/* Price card */}
            <div className="mt-8 inline-flex items-baseline gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3">
              <span className="text-sm text-white/70">
                {data.priceLabel}:
              </span>
              <span className="text-2xl md:text-3xl font-bold text-white">
                od {data.priceFrom} €
              </span>
              <span className="text-sm text-white/70">/m²</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══ INTRO ═══ */}
      <Section tone="default" size="md">
        <Container size="md">
          <div className="prose prose-lg max-w-none prose-p:text-zinc-700 prose-p:leading-relaxed">
            {data.intro.map((para, i) => (
              <p key={i} className="text-lg text-zinc-700 leading-relaxed mt-4 first:mt-0">
                {para}
              </p>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══ ČO TO JE ═══ */}
      <Section tone="muted" size="md">
        <Container size="md">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            {data.whatIsTitle}
          </h2>
          <div className="mt-6 space-y-4">
            {data.whatIs.map((para, i) => (
              <p
                key={i}
                className="text-base md:text-lg text-zinc-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: para.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-zinc-900 font-semibold">$1</strong>',
                  ),
                }}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══ APPLICATIONS ═══ */}
      <Section tone="default" size="md">
        <Container size="xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
              {data.applicationsTitle}
            </h2>
            <p className="mt-3 text-lg text-zinc-600">
              Realizujeme {data.shortName} systémy po celom Slovensku — od malých
              prevádzok po veľké priemyselné haly.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.applications.map((app) => (
              <div
                key={app.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-lg hover:border-zinc-300 transition-all"
              >
                <div className="text-4xl mb-3" aria-hidden>
                  {app.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  {app.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {app.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══ STANDARDS ═══ */}
      <Section tone="muted" size="md">
        <Container size="md">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            {data.standardsTitle}
          </h2>
          <p className="mt-3 text-lg text-zinc-600">
            Náš systém spĺňa aktuálne EÚ a slovenské normy platné pre {data.shortName}.
          </p>
          <div className="mt-8 space-y-4">
            {data.standards.map((std) => (
              <div
                key={std.code}
                className="rounded-xl border-l-4 bg-white px-5 py-4"
                style={{ borderLeftColor: data.accent }}
              >
                <div className="font-mono font-bold text-sm text-zinc-900">
                  {std.code}
                </div>
                <div className="mt-1 text-sm text-zinc-700 leading-relaxed">
                  {std.description}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══ BENEFITS + PRICING ═══ */}
      <Section tone="default" size="md">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
                Prečo naša {data.shortName} podlaha
              </h2>
              <div className="mt-6 space-y-4">
                {data.benefits.map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <div
                      className="shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center"
                      style={{ background: `${data.accent}20` }}
                    >
                      <Check
                        className="w-4 h-4"
                        style={{ color: data.accent }}
                        strokeWidth={3}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{b.title}</h3>
                      <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-3xl p-8 text-white sticky top-4"
              style={{
                background: `linear-gradient(135deg, ${data.accent} 0%, ${data.accent}CC 100%)`,
              }}
            >
              <div className="text-sm font-semibold uppercase tracking-wider opacity-90">
                {data.priceLabel}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold">
                  od {data.priceFrom} €
                </span>
                <span className="text-lg opacity-90">/m²</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed opacity-95">
                {data.priceNote}
              </p>
              <Link
                href="/cenova-ponuka"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-white text-zinc-900 font-bold hover:bg-white/90 transition-colors"
              >
                Presná kalkulácia zdarma
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`tel:${SITE.contact.phoneRaw}`}
                className="mt-3 flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-white/15 border border-white/40 text-white font-semibold hover:bg-white/25 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {SITE.contact.phone}
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* ═══ FAQ ═══ */}
      <Section tone="muted" size="md">
        <Container size="md">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            Časté otázky
          </h2>
          <p className="mt-3 text-lg text-zinc-600">
            {data.shortName} podlahy — čo najčastejšie riešime s klientmi.
          </p>
          <div className="mt-8 space-y-3">
            {data.faq.map((q, i) => (
              <details
                key={i}
                className="group rounded-xl border border-zinc-200 bg-white overflow-hidden"
              >
                <summary className="cursor-pointer px-5 py-4 font-semibold text-zinc-900 hover:bg-zinc-50 list-none flex items-center justify-between gap-4">
                  <span>{q.question}</span>
                  <span
                    className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center group-open:rotate-45 transition-transform"
                    style={{ background: `${data.accent}20`, color: data.accent }}
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-1 text-zinc-700 leading-relaxed border-t border-zinc-100">
                  {q.answer}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══ RELATED CERTS ═══ */}
      <Section tone="default" size="md">
        <Container size="xl">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
            Ďalšie certifikované systémy
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/podlahy/${r.slug}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-lg hover:border-zinc-300 transition-all"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: r.accent,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {r.emoji}
                  </span>
                  <div className="font-bold text-zinc-900">{r.shortName}</div>
                </div>
                <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
                  {r.heroTagline}
                </p>
                <div className="mt-3 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: r.accent }}>
                  Viac o {r.shortName}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══ FINAL CTA ═══ */}
      <Section tone="ink" size="md">
        <Container size="md" className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Potrebujete {data.shortName} podlahu?
          </h2>
          <p className="mt-3 text-lg text-white/80 max-w-2xl mx-auto">
            Cenu upresníme po obhliadke — meranie, technický návrh systému a
            kalkulácia sú bezplatné a nezáväzné.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cenova-ponuka"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-900 font-bold hover:bg-white/90 transition-colors"
            >
              Nezáväzná cenová ponuka
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Zavolať: {SITE.contact.phone}
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
