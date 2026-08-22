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
import { KurzJsonLd } from "@/components/kurz/KurzJsonLd";
import { KurzForm } from "@/components/kurz/KurzForm";
import { KurzStickyCta } from "@/components/kurz/KurzStickyCta";
import { SITE } from "@/lib/site";
import {
  KURZ,
  KURZ_FOR,
  KURZ_INCLUDED,
  KURZ_PROGRAM,
  KURZ_STATS,
  KURZ_FAQ,
  KURZ_FAKTY,
  KURZ_SUMMARY,
} from "@/content/kurz";

export const metadata: Metadata = {
  title: "Kurz epoxidových podláh — 2-dňové školenie",
  description:
    "Praktický kurz liatych epoxidových podláh v Ružomberku. 2 dni, max. 6 ľudí, vlastná plocha 12 m², materiál a náradie v cene, certifikát a 30 dní podpory. Od 690 €.",
  keywords: [
    "kurz epoxidových podláh",
    "školenie epoxidové podlahy",
    "kurz liatych podláh",
    "ako robiť epoxidovú podlahu",
    "epoxidové podlahy školenie Slovensko",
    "rekvalifikačný kurz podlahár",
    "kurz metalickej podlahy",
    "kurz chipsových podláh",
    "epoxid kurz Ružomberok",
    "naučiť sa liať epoxidovú podlahu",
  ],
  alternates: {
    canonical: "/kurz",
    languages: {
      "sk-SK": "/kurz",
      en: "/en/epoxy-flooring-course",
      "x-default": "/kurz",
    },
  },
  openGraph: {
    type: "article",
    locale: "sk_SK",
    title: "Kurz epoxidových podláh — nauč sa liať za 2 dni",
    description:
      "Max. 6 ľudí v skupine, 80 % času s náradím v ruke, vlastná plocha 12 m². Materiál, náradie, manuál aj certifikát v cene. Od 690 €.",
    url: "/kurz",
    images: [{ url: "/og-home.jpg?v=3", width: 1200, height: 630, alt: "Kurz epoxidových podláh EPOXIDOVO Akadémia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kurz epoxidových podláh — EPOXIDOVO Akadémia",
    description: "2 dni praxe, max. 6 ľudí, vlastná plocha 12 m². Od 690 €.",
    images: ["/og-home.jpg?v=3"],
  },
};

export default function KurzPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Kurz", path: "/kurz" },
        ]}
      />
      <KurzJsonLd
        locale="sk"
        path="/kurz"
        name={KURZ.name}
        description="Dvojdňový praktický kurz liatych epoxidových podláh — príprava podkladu, jednofarebná liata podlaha, chipsy, metalický efekt, detaily a cenotvorba."
        summary={KURZ_SUMMARY}
        place={KURZ.place}
        duration={KURZ.duration}
        groupSize={KURZ.groupSize}
        priceStandard={KURZ.priceStandard}
        pricePro={KURZ.pricePro}
        terms={KURZ.nextTerms}
        teaches={[
          "Diagnostika a príprava betónového podkladu",
          "Brúsenie a frézovanie diamantovým náradím",
          "Penetrácia a vysprávky",
          "Miešanie dvojzložkových epoxidových živíc",
          "Liatie jednofarebnej epoxidovej podlahy",
          "Chipsový dekor a transparentný uzáver",
          "Metalický efekt a tvorba kresby",
          "Sokle, prechody a detaily",
          "Cenotvorba a kalkulácia zákazky",
        ]}
        faq={KURZ_FAQ}
        syllabus={KURZ_PROGRAM}
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
              EPOXIDOVO Akadémia
            </span>

            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Nauč sa liať
              <br />
              <span className="text-[var(--color-brand)]">epoxidové podlahy</span>
              <br />
              za dva dni.
            </h1>

            <p className="mt-6 text-base md:text-xl text-white/75 leading-relaxed max-w-2xl">
              Žiadna teória z prezentácie. Prídeš, obrúsiš podklad, namiešaš,
              odleješ si vlastnú plochu a odídeš s postupom, ktorý vieš zopakovať
              u zákazníka.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <Clock className="w-4 h-4 text-[var(--color-brand)]" aria-hidden />
                {KURZ.duration}
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <MapPin className="w-4 h-4 text-[var(--color-brand)]" aria-hidden />
                {KURZ.place}
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <Users className="w-4 h-4 text-[var(--color-brand)]" aria-hidden />
                max. {KURZ.groupSize} ľudí v skupine
              </span>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="#prihlaska"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-[var(--color-copper)] text-white font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-copper-light)]"
              >
                Rezervovať miesto — od {KURZ.priceStandard} €
                <ArrowRight className="w-4 h-4" aria-hidden />
              </a>
              <a
                href="#program"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl border border-white/30 text-white font-semibold whitespace-nowrap transition-colors hover:bg-white hover:text-[var(--color-brown-dark)]"
              >
                Pozrieť program
              </a>
            </div>

            <p className="mt-5 text-xs text-white/50">
              Najbližší termín {KURZ.nextTerms[0].date} · zostávajú{" "}
              {KURZ.nextTerms[0].left} miesta
            </p>
          </div>
        </Container>
      </section>

      {/* ============ ČÍSLA ============ */}
      <Section tone="default" size="sm">
        <Container size="xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {KURZ_STATS.map((s, i) => (
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

      {/* ============ PRE KOHO ============ */}
      <Section tone="soft" size="md">
        <Container size="xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Pre koho to je
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
              Ak ťa niečo z toho vystihuje,
              <br />
              <span className="text-[var(--color-fg-muted)] font-normal">
                sedíš u nás správne.
              </span>
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            {KURZ_FOR.map((f, i) => (
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

      {/* ============ PROGRAM ============ */}
      <Section tone="default" size="md" id="program">
        <Container size="xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Program
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
              Dva dni, dve témy.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--color-fg-muted)] leading-relaxed">
              Prvý deň sa hrabeme v podklade — tam vzniká 90 % reklamácií. Druhý
              deň lejeme, dekorujeme a počítame ceny.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {KURZ_PROGRAM.map((day, i) => (
              <Reveal key={day.day} delay={i * 80}>
                <div className="h-full rounded-3xl border border-[var(--color-border)] overflow-hidden">
                  <div className="relative h-44 md:h-52">
                    <Image
                      src={
                        i === 0
                          ? "/images/hero/hala.webp"
                          : "/images/hero/garaz.webp"
                      }
                      alt=""
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

      {/* ============ ČO DOSTANEŠ ============ */}
      <Section tone="default" size="md" className="bg-[var(--color-brown)] text-white">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                V cene kurzu
              </p>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
                Prídeš v montérkach.
                <br />
                <span className="text-white/60 font-normal">Zvyšok máme.</span>
              </h2>
              <p className="mt-5 text-white/70 leading-relaxed">
                Nemusíš nič kupovať dopredu ani nič skúšať naslepo doma. Materiál,
                náradie aj chyby ideš robiť u nás — nie na prvej zákazke.
              </p>
            </div>

            <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {KURZ_INCLUDED.map((item) => (
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

      {/* ============ CENY ============ */}
      <Section tone="soft" size="md" id="cena">
        <Container size="lg">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Cena
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
              Jedna zákazka a máš to späť.
            </h2>
            <p className="mt-5 text-base text-[var(--color-fg-muted)] leading-relaxed">
              Bežná garáž 30 m² sa fakturuje okolo 1 500 €. Kurz sa ti vráti na
              prvej alebo druhej realizácii.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ŠTANDARD */}
            <div className="p-8 md:p-10 rounded-3xl bg-white border border-[var(--color-border)] flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-subtle)]">
                Štandard
              </h3>
              <p className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
                {KURZ.priceStandard} €
              </p>
              <p className="mt-1.5 text-sm text-[var(--color-fg-subtle)]">
                za osobu · nie sme platcami DPH, cena je konečná
              </p>
              <ul className="mt-7 space-y-3 flex-1">
                {[
                  "Kompletné 2-dňové školenie",
                  "Vlastná plocha 12 m²",
                  "Manuál, kalkulačka spotreby, certifikát",
                  "30 dní podpory po kurze",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-copper)]" aria-hidden />
                    <span className="text-[var(--color-fg-muted)]">{t}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#prihlaska"
                className="mt-8 inline-flex items-center justify-center h-13 px-7 py-3.5 rounded-xl border border-[var(--color-fg)] font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-fg)] hover:text-white"
              >
                Chcem štandard
              </a>
            </div>

            {/* PRO */}
            <div className="relative p-8 md:p-10 rounded-3xl bg-[var(--color-fg)] text-white flex flex-col shadow-[var(--shadow-card-hover)]">
              <span className="absolute top-6 right-6 rounded-full bg-[var(--color-copper)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] whitespace-nowrap">
                Odporúčame
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                Pro
              </h3>
              <p className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
                {KURZ.pricePro} €
              </p>
              <p className="mt-1.5 text-sm text-white/50">
                za osobu · štartovací balík v cene
              </p>
              <ul className="mt-7 space-y-3 flex-1">
                {[
                  "Všetko zo Štandardu",
                  "Štartovací balík materiálu na prvú zákazku (~20 m²)",
                  "Sada náradia — stierka, ježko, valec, miešadlo",
                  "Partnerské ceny v našom e-shope natrvalo",
                  "3 mesiace konzultácií a pomoc s prvou cenovou ponukou",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-brand)]" aria-hidden />
                    <span className="text-white/80">{t}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#prihlaska"
                className="mt-8 inline-flex items-center justify-center h-13 px-7 py-3.5 rounded-xl bg-[var(--color-copper)] text-white font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-copper-light)]"
              >
                Chcem PRO
              </a>
            </div>
          </div>

          <p className="mt-6 text-sm text-[var(--color-fg-muted)]">
            Idete traja a viac z jednej firmy?{" "}
            <a href="#prihlaska" className="underline underline-offset-2 hover:text-[var(--color-fg)]">
              Ozvi sa
            </a>{" "}
            — spravíme firemný termín len pre vás.
          </p>
        </Container>
      </Section>

      {/* ============ TERMÍNY + FORMULÁR ============ */}
      <Section tone="default" size="md" id="prihlaska">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Termíny
              </p>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
                Šesť miest.
                <br />
                <span className="text-[var(--color-fg-muted)] font-normal">
                  Potom sa čaká mesiac.
                </span>
              </h2>

              <ul className="mt-8 space-y-3">
                {KURZ.nextTerms.map((t) => (
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
                      {t.left <= 3 ? `Posledné ${t.left} miesta` : `Voľných ${t.left}`}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-6 rounded-2xl bg-[var(--color-bg-soft)] border border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
                  Radšej sa opýtaš telefonicky? Zavolaj — poradíme, či je kurz pre
                  teba, aj keď sa nakoniec neprihlásiš.
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
              <KurzForm />
            </div>
          </div>
        </Container>
      </Section>

      {/* ============ KURZ V SKRATKE (GEO: extrahovateľné fakty) ============ */}
      <Section tone="default" size="md" id="fakty">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Kurz v skratke
              </p>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                Všetko podstatné na jednom mieste.
              </h2>
              <p
                data-speakable
                className="mt-5 text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed"
              >
                {KURZ_SUMMARY}
              </p>
            </div>

            <div className="lg:col-span-7">
              <dl className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {KURZ_FAKTY.map((f) => (
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
                Hľadáš kurz v angličtine?{" "}
                <a
                  href="/en/epoxy-flooring-course"
                  hrefLang="en"
                  className="underline underline-offset-2 transition-colors hover:text-[var(--color-fg)]"
                >
                  English version of this course page
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
            Časté otázky
          </p>
          <h2 className="mt-4 mb-10 text-3xl md:text-5xl font-bold tracking-tight">
            Ešte niečo nie je jasné?
          </h2>
          <KurzFaq items={KURZ_FAQ} />
        </Container>
      </Section>

      <KurzStickyCta
        meta="2 dni · Ružomberok"
        price={`od ${KURZ.priceStandard} €`}
        cta="Rezervovať miesto"
      />
      <div className="md:hidden h-16" aria-hidden />
    </>
  );
}
