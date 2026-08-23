import { SITE } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld-safe";

export interface CourseSchemaInput {
  locale: "sk" | "en";
  path: string;
  name: string;
  description: string;
  summary: string;
  place: string;
  duration: string;
  groupSize: number;
  priceStandard: number;
  pricePro: number;
  terms: readonly { date: string; iso: string; left: number }[];
  teaches: readonly string[];
  faq: readonly { q: string; a: string }[];
  syllabus: readonly { day: string; subtitle: string; items: readonly string[] }[];
}

/**
 * Structured data pre landing kurzu — SK aj EN verzia zdieľajú tento builder.
 *
 * Pokrýva:
 * - Course + CourseInstance (Google „Course info" rich result, každý termín zvlášť)
 * - Syllabus (moduly) ako itemListElement — AI odpovedače z toho čítajú obsah
 * - FAQPage (rich snippet + priama citácia v AI odpovediach)
 * - WebPage so speakable + primaryImageOfPage + inLanguage
 *
 * Reference: https://developers.google.com/search/docs/appearance/structured-data/course
 */
export function KurzJsonLd(input: CourseSchemaInput) {
  const url = `${SITE.url}${input.path}`;
  const lang = input.locale === "sk" ? "sk-SK" : "en";
  // Kurz je 2-dňový → koniec = začiatok + 1 deň.
  const endOf = (iso: string) => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  };
  // Ceny držíme platné do konca roka posledného vypísaného termínu.
  const priceValidUntil = `${input.terms[input.terms.length - 1].iso.slice(0, 4)}-12-31`;

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: input.name,
    description: input.description,
    abstract: input.summary,
    url,
    inLanguage: lang,
    isAccessibleForFree: false,
    educationalLevel: input.locale === "sk" ? "Začiatočník až mierne pokročilý" : "Beginner to intermediate",
    teaches: [...input.teaches],
    coursePrerequisites:
      input.locale === "sk"
        ? "Žiadne — kurz je vhodný aj pre úplných začiatočníkov."
        : "None — the course is suitable for complete beginners.",
    occupationalCategory: [
      { "@type": "CategoryCode", codeValue: "47-2042", name: "Floor Layers" },
    ],
    educationalCredentialAwarded:
      input.locale === "sk"
        ? "Osvedčenie o absolvovaní EPOXIDOVO Akadémie"
        : "EPOXIDOVO Academy certificate of completion",
    provider: {
      "@type": "Organization",
      "@id": `${SITE.url}/#business`,
      name: SITE.legalName,
      url: SITE.url,
    },
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: input.priceStandard,
      priceCurrency: "EUR",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      url,
      validFrom: input.terms[0].iso,
    },
    hasCourseInstance: input.terms.map((t) => ({
      "@type": "CourseInstance",
      name: `${input.name} — ${t.date}`,
      courseMode: "onsite",
      courseWorkload: "PT16H",
      startDate: t.iso,
      endDate: endOf(t.iso),
      maximumAttendeeCapacity: input.groupSize,
      // Kurz sa VYUČUJE po anglicky (lektor rozumie aj slovensky) — nezávisí
      // od jazyka stránky; inLanguage na Course/WebPage ostáva jazykom obsahu.
      inLanguage: "en",
      location: {
        "@type": "Place",
        name: input.place,
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.city,
          postalCode: SITE.address.postalCode,
          addressCountry: SITE.address.countryCode,
        },
        geo: { "@type": "GeoCoordinates", latitude: 49.0775, longitude: 19.3066 },
      },
      instructor: {
        "@type": "Person",
        name: "EPOXIDOVO",
        worksFor: { "@id": `${SITE.url}/#business` },
      },
      offers: {
        "@type": "Offer",
        price: input.priceStandard,
        priceCurrency: "EUR",
        availability:
          t.left > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        url,
      },
    })),
    syllabusSections: input.syllabus.map((day, i) => ({
      "@type": "Syllabus",
      position: i + 1,
      name: `${day.day} — ${day.subtitle}`,
      description: day.items.join(" "),
      timeRequired: "PT8H",
    })),
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: lang,
    mainEntity: input.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: lang,
    isPartOf: { "@type": "WebSite", "@id": `${SITE.url}/#website`, url: SITE.url, name: SITE.name },
    about: { "@id": `${url}#course` },
    primaryImageOfPage: `${SITE.url}/og-home.jpg`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
    provider: { "@id": `${SITE.url}/#business` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(course) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPage) }} />
    </>
  );
}
