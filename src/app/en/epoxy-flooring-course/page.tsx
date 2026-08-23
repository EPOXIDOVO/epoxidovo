import type { Metadata } from "next";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { KurzJsonLd } from "@/components/kurz/KurzJsonLd";
import { KurzShell } from "@/components/kurz/landing/KurzShell";
import {
  COURSE_EN,
  COURSE_EN_FACTS,
  COURSE_EN_FAQ,
  COURSE_EN_PROGRAM,
  COURSE_EN_SUMMARY,
} from "@/content/kurz-en";

const PATH = "/en/epoxy-flooring-course";

export const metadata: Metadata = {
  title: { absolute: "Epoxy Flooring Course in Europe — 2-Day Training" },
  description:
    "Hands-on epoxy resin flooring training in Slovakia. 2 days, max. 6 people, 12 m² you pour yourself, material and tools included. From €690.",
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
    <>
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
      <section className="sr-only" aria-label="Course at a glance" lang="en">
        <p data-speakable>{COURSE_EN_SUMMARY}</p>
        <dl>
          {COURSE_EN_FACTS.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <KurzShell locale="en" />
    </>
  );
}
