import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Users,
  Phone,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { KurzFaq } from "@/components/kurz/KurzFaq";
import { KurzForm } from "@/components/kurz/KurzForm";
import { KurzJsonLd } from "@/components/kurz/KurzJsonLd";
import { KurzStickyCta } from "@/components/kurz/KurzStickyCta";
import { HtmlLang } from "@/components/kurz/HtmlLang";
import { SITE } from "@/lib/site";
import {
  COURSE_EN,
  COURSE_EN_FACTS,
  COURSE_EN_FAQ,
  COURSE_EN_FOR,
  COURSE_EN_INCLUDED,
  COURSE_EN_PROGRAM,
  COURSE_EN_STATS,
  COURSE_EN_SUMMARY,
} from "@/content/kurz-en";

const PATH = "/en/epoxy-flooring-course";

export const metadata: Metadata = {
  title: "Epoxy Flooring Course — 2-Day Hands-On Training | EPOXIDOVO Academy",
  description:
    "Learn to install poured epoxy resin floors in 2 days near Ružomberok, Slovakia. Max. 6 people, 12 m² you pour yourself, material and tools included, certificate and 30 days of support. From €690.",
  keywords: [
    "epoxy flooring course",
    "epoxy floor training",
    "resin flooring course Europe",
    "metallic epoxy floor training",
    "flake floor course",
    "learn to install epoxy floors",
    "epoxy flooring certification",
    "polyaspartic training",
    "epoxy floor course Slovakia",
    "hands-on resin floor workshop",
  ],
  alternates: {
    canonical: PATH,
    languages: {
      en: PATH,
      "sk-SK": "/kurz",
      "x-default": "/kurz",
    },
  },
  openGraph: {
    type: "article",
    locale: "en_GB",
    alternateLocale: ["sk_SK"],
    title: "Epoxy Flooring Course — learn to pour a floor in 2 days",
    description:
      "Hands-on epoxy resin flooring training in Slovakia. Max. 6 people per group, 80 % of the time with tools in hand, 12 m² you pour yourself. From €690.",
    url: PATH,
    images: [
      {
        url: "/og-home.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "EPOXIDOVO Academy epoxy flooring course",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Epoxy Flooring Course — EPOXIDOVO Academy",
    description: "2 days of practice, max. 6 people, 12 m² you pour yourself. From €690.",
    images: ["/og-home.jpg?v=3"],
  },
};

export default function EpoxyFlooringCoursePage() {
  return (
    <div lang="en">
      <HtmlLang lang="en" />
      <BreadcrumbsJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Epoxy flooring course", path: PATH },
        ]}
      />
      <KurzJsonLd
        locale="en"
        path={PATH}
        name={COURSE_EN.name}
        description="A two-day hands-on epoxy flooring course — substrate preparation, single-colour poured floor, flakes, metallic effect, detailing and job pricing."
        summary={COURSE_EN_SUMMARY}
        place={COURSE_EN.place}
        duration={COURSE_EN.duration}
        groupSize={COURSE_EN.groupSize}
        priceStandard={COURSE_EN.priceStandard}
        pricePro={COURSE_EN.pricePro}
        terms={COURSE_EN.nextTerms}
        teaches={[
          "Concrete substrate diagnostics and preparation",
          "Diamond grinding and milling",
          "Priming and patching",
          "Mixing two-component epoxy resins",
          "Pouring a single-colour epoxy floor",
          "Flake broadcasting and transparent top coat",
          "Metallic effect and pattern creation",
          "Coving, transitions and detail work",
          "Pricing and job calculation",
        ]}
        faq={COURSE_EN_FAQ}
        syllabus={COURSE_EN_PROGRAM}
      />

      {/* ============ HERO ============ */}
      <section className="relative w-full overflow-hidden bg-[var(--color-brown-dark)] text-white">
        <Image
          src="/images/process/step-03-liatie.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[var(--color-brown-dark)]/85 via-[var(--color-brown-dark)]/70 to-[var(--color-brown-dark)]"
        />
        <Container size="xl" className="relative py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              EPOXIDOVO Academy
            </span>

            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Learn to pour
              <br />
              <span className="text-[var(--color-brand)]">epoxy resin floors</span>
              <br />
              in two days.
            </h1>

            <p className="mt-6 text-base md:text-xl text-white/75 leading-relaxed max-w-2xl">
              No slideshow theory. You grind the substrate, mix the resin, pour
              your own floor and leave with a process you can repeat on a client
              site the following week.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <Clock className="w-4 h-4 text-[var(--color-brand)]" aria-hidden />
                {COURSE_EN.duration}
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <MapPin className="w-4 h-4 text-[var(--color-brand)]" aria-hidden />
                {COURSE_EN.place}
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <Users className="w-4 h-4 text-[var(--color-brand)]" aria-hidden />
                max. {COURSE_EN.groupSize} people per group
              </span>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="#apply"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-[var(--color-copper)] text-white font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-copper-light)]"
              >
                Reserve a seat — from €{COURSE_EN.priceStandard}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </a>
              <a
                href="#curriculum"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl border border-white/30 text-white font-semibold whitespace-nowrap transition-colors hover:bg-white hover:text-[var(--color-brown-dark)]"
              >
                See the curriculum
              </a>
            </div>

            <p className="mt-5 text-xs text-white/50">
              Next date {COURSE_EN.nextTerms[0].date} · {COURSE_EN.nextTerms[0].left}{" "}
              seats left ·{" "}
              <a
                href="/kurz"
                hrefLang="sk"
                className="underline underline-offset-2 hover:text-white"
              >
                Slovenská verzia
              </a>
            </p>
          </div>
        </Container>
      </section>

      {/* ============ NUMBERS ============ */}
      <Section tone="default" size="sm">
        <Container size="xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {COURSE_EN_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 60}>
                <p className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-copper)]">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-[var(--color-fg-muted)] leading-snug">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ============ WHO IT IS FOR ============ */}
      <Section tone="soft" size="md">
        <Container size="xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Who it is for
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
              If one of these is you,
              <br />
              <span className="text-[var(--color-fg-muted)] font-normal">
                you are in the right room.
              </span>
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            {COURSE_EN_FOR.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="h-full p-7 md:p-8 rounded-3xl bg-white border border-[var(--color-border)] transition-all duration-500 hover:border-[var(--color-fg)] hover:shadow-[var(--shadow-card-hover)]">
                  <span className="text-xs font-mono text-[var(--color-fg-subtle)]">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 text-xl font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2.5 text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed">
                    {f.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ============ CURRICULUM ============ */}
      <Section tone="default" size="md" id="curriculum">
        <Container size="xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Curriculum
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
              Two days, two themes.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--color-fg-muted)] leading-relaxed">
              Day one digs into the substrate — that is where 90 % of failures
              start. Day two is pouring, decorative finishes and pricing.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {COURSE_EN_PROGRAM.map((day, i) => (
              <Reveal key={day.day} delay={i * 80}>
                <div className="h-full rounded-3xl border border-[var(--color-border)] overflow-hidden">
                  <div className="relative h-44 md:h-52">
                    <Image
                      src={i === 0 ? "/images/hero/hala.webp" : "/images/hero/garaz.webp"}
                      alt={
                        i === 0
                          ? "Industrial concrete substrate before an epoxy floor is applied"
                          : "Finished metallic epoxy garage floor"
                      }
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
                    />
                    <div className="absolute bottom-5 left-6 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                        {day.day}
                      </p>
                      <h3 className="mt-1 text-2xl font-bold tracking-tight">
                        {day.subtitle}
                      </h3>
                    </div>
                  </div>
                  <ul className="p-6 md:p-8 space-y-3.5">
                    {day.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm md:text-base">
                        <Check
                          className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-copper)]"
                          aria-hidden
                        />
                        <span className="text-[var(--color-fg-muted)] leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ============ WHAT IS INCLUDED ============ */}
      <Section tone="default" size="md" className="bg-[var(--color-brown)] text-white">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Included in the price
              </p>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
                Bring work clothes.
                <br />
                <span className="text-white/60 font-normal">We have the rest.</span>
              </h2>
              <p className="mt-5 text-white/70 leading-relaxed">
                Nothing to buy in advance, nothing to guess at home. Material,
                tools and your first mistakes all happen here — not on your first
                paid job.
              </p>
            </div>

            <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {COURSE_EN_INCLUDED.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check
                    className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-brand)]"
                    aria-hidden
                  />
                  <span className="text-sm md:text-base text-white/85 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ============ PRICING ============ */}
      <Section tone="soft" size="md" id="pricing">
        <Container size="lg">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Price
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
              One job and it pays for itself.
            </h2>
            <p className="mt-5 text-base text-[var(--color-fg-muted)] leading-relaxed">
              A standard 30 m² garage is invoiced at around €1,500. The course
              returns on your first or second installation.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 md:p-10 rounded-3xl bg-white border border-[var(--color-border)] flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-subtle)]">
                Standard
              </h3>
              <p className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
                €{COURSE_EN.priceStandard}
              </p>
              <p className="mt-1.5 text-sm text-[var(--color-fg-subtle)]">
                per person · we are not VAT registered, this is the final price
              </p>
              <ul className="mt-7 space-y-3 flex-1">
                {[
                  "The complete 2-day training",
                  "Your own 12 m² area",
                  "Manual, consumption calculator, certificate",
                  "30 days of post-course support",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-copper)]" aria-hidden />
                    <span className="text-[var(--color-fg-muted)]">{t}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#apply"
                className="mt-8 inline-flex items-center justify-center h-13 px-7 py-3.5 rounded-xl border border-[var(--color-fg)] font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-fg)] hover:text-white"
              >
                Choose Standard
              </a>
            </div>

            <div className="relative p-8 md:p-10 rounded-3xl bg-[var(--color-fg)] text-white flex flex-col shadow-[var(--shadow-card-hover)]">
              <span className="absolute top-6 right-6 rounded-full bg-[var(--color-copper)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] whitespace-nowrap">
                Recommended
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                Pro
              </h3>
              <p className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
                €{COURSE_EN.pricePro}
              </p>
              <p className="mt-1.5 text-sm text-white/50">
                per person · starter package included
              </p>
              <ul className="mt-7 space-y-3 flex-1">
                {[
                  "Everything in Standard",
                  "Starter material package for your first job (~20 m²)",
                  "Tool set — squeegee, spiked roller, roller, mixer",
                  "Partner pricing in our e-shop, permanently",
                  "3 months of consulting and help with your first quote",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-brand)]" aria-hidden />
                    <span className="text-white/80">{t}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#apply"
                className="mt-8 inline-flex items-center justify-center h-13 px-7 py-3.5 rounded-xl bg-[var(--color-copper)] text-white font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-copper-light)]"
              >
                Choose Pro
              </a>
            </div>
          </div>

          <p className="mt-6 text-sm text-[var(--color-fg-muted)]">
            Three or more people from one company?{" "}
            <a href="#apply" className="underline underline-offset-2 hover:text-[var(--color-fg)]">
              Get in touch
            </a>{" "}
            — we will run a private date just for your crew.
          </p>
        </Container>
      </Section>

      {/* ============ DATES + FORM ============ */}
      <Section tone="default" size="md" id="apply">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Dates
              </p>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
                Six seats.
                <br />
                <span className="text-[var(--color-fg-muted)] font-normal">
                  Then it is a month of waiting.
                </span>
              </h2>

              <ul className="mt-8 space-y-3">
                {COURSE_EN.nextTerms.map((t) => (
                  <li
                    key={t.date}
                    className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-[var(--color-border)] transition-colors hover:border-[var(--color-fg)]"
                  >
                    <span className="font-semibold">{t.date}</span>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                        t.left <= 3
                          ? "bg-orange-50 text-[var(--color-copper)]"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {t.left <= 3 ? `Last ${t.left} seats` : `${t.left} seats free`}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-6 rounded-2xl bg-[var(--color-bg-soft)] border border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
                  Prefer to ask over the phone? Call us — we will tell you
                  honestly whether the course fits you, even if you never book.
                </p>
                <a
                  href={`tel:${SITE.contact.phoneRaw}`}
                  className="mt-3 inline-flex items-center gap-2 font-semibold whitespace-nowrap transition-colors hover:text-[var(--color-brand-deep)]"
                >
                  <Phone className="w-4 h-4" aria-hidden />
                  {SITE.contact.phone}
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <KurzForm locale="en" />
            </div>
          </div>
        </Container>
      </Section>

      {/* ============ COURSE AT A GLANCE (GEO facts) ============ */}
      <Section tone="default" size="md" id="facts">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Course at a glance
              </p>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                Everything essential in one place.
              </h2>
              <p
                data-speakable
                className="mt-5 text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed"
              >
                {COURSE_EN_SUMMARY}
              </p>
            </div>

            <div className="lg:col-span-7">
              <dl className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {COURSE_EN_FACTS.map((f) => (
                  <div
                    key={f.label}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6 py-4"
                  >
                    <dt className="text-sm font-semibold text-[var(--color-fg)]">
                      {f.label}
                    </dt>
                    <dd className="sm:col-span-2 text-sm text-[var(--color-fg-muted)] leading-relaxed">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm text-[var(--color-fg-muted)]">
                Slovak speaker?{" "}
                <a
                  href="/kurz"
                  hrefLang="sk"
                  className="underline underline-offset-2 transition-colors hover:text-[var(--color-fg)]"
                >
                  Slovenská verzia tejto stránky
                </a>
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ============ FAQ ============ */}
      <Section tone="soft" size="md">
        <Container size="md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Frequently asked
          </p>
          <h2 className="mt-4 mb-10 text-3xl md:text-5xl font-bold tracking-tight">
            Still unclear about something?
          </h2>
          <KurzFaq items={COURSE_EN_FAQ} />
        </Container>
      </Section>

      <KurzStickyCta
        meta="2 days · Slovakia"
        price={`from €${COURSE_EN.priceStandard}`}
        cta="Reserve a seat"
      />
      <div className="md:hidden h-16" aria-hidden />
    </div>
  );
}
