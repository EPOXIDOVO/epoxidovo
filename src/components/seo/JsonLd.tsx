import { SITE } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld-safe";

/**
 * JSON-LD štruktúrované údaje pre Google.
 * - LocalBusiness (kontakt, adresa, IČO/DIČ)
 * - Service (každá kategória podláh ako služba)
 * - Organization (firemné info)
 */
export function JsonLd() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE.url}/#business`,
    name: SITE.legalName,
    alternateName: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.contact.phone,
    email: SITE.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.countryCode,
    },
    // Sídlo (Ružomberok) — približné geo súradnice
    geo: {
      "@type": "GeoCoordinates",
      latitude: 49.0775,
      longitude: 19.3066,
    },
    areaServed: [
      { "@type": "Country", name: "Slovensko" },
      { "@type": "AdministrativeArea", name: "Žilinský kraj" },
      { "@type": "AdministrativeArea", name: "Bratislavský kraj" },
      { "@type": "AdministrativeArea", name: "Trnavský kraj" },
      { "@type": "AdministrativeArea", name: "Trenčiansky kraj" },
      { "@type": "AdministrativeArea", name: "Nitriansky kraj" },
      { "@type": "AdministrativeArea", name: "Banskobystrický kraj" },
      { "@type": "AdministrativeArea", name: "Prešovský kraj" },
      { "@type": "AdministrativeArea", name: "Košický kraj" },
    ],
    // Otváracie hodiny — Po–Pi 8:00–17:00
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    paymentAccepted: ["Cash", "Bank transfer", "Invoice"],
    currenciesAccepted: "EUR",
    foundingDate: SITE.business.foundedAt,
    identifier: [
      { "@type": "PropertyValue", propertyID: "IČO", value: SITE.business.icoRaw },
      { "@type": "PropertyValue", propertyID: "DIČ", value: SITE.business.dic },
    ],
    vatID: SITE.business.icDph ?? undefined,
    image: `${SITE.url}/images/site/logo_v2.png`,
    logo: `${SITE.url}/images/site/logo.png`,
    priceRange: "€€",
    aggregateRating: {
      "@type": "AggregateRating",
      // rovnaké čísla ako na webe (4,87 z 1 638) — rozdiel medzi schémou
      // a stránkou Google trestá ako zavádzajúce štruktúrované dáta
      ratingValue: "4.87",
      reviewCount: "1638",
      bestRating: "5",
      worstRating: "1",
    },
    knowsLanguage: ["sk", "cs", "en"],
    subOrganization: { "@id": `${SITE.url}/#academy` },
    sameAs: [
      SITE.social.facebook,
      SITE.social.instagram,
      SITE.social.tiktok,
      SITE.social.youtube,
    ].filter(Boolean),
  };

  const services = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE.url}/#services`,
    serviceType: "Epoxidové podlahy",
    provider: { "@id": `${SITE.url}/#business` },
    areaServed: "SK",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Typy epoxidových podláh",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Jednofarebné epoxidové podlahy",
            description:
              "Hladký monolitický povrch v jednom odtieni — ideálne pre moderné interiéry.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Chipsové podlahy",
            description:
              "Farebné vločky zaliate v lesklom epoxide — odolné a praktické.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Metalické epoxidové podlahy",
            description: "Pigmenty s metalickým efektom — 3D ilúzia hĺbky.",
          },
        },
      ],
    },
  };

  // FAQ schema — pomáha pri rich snippets v Google
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Ako dlho trvá realizácia epoxidovej podlahy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bežná podlaha do 50 m² trvá 3–5 dní vrátane prípravy podkladu, aplikácie a vytvrdnutia. Komplikovanejšie projekty (metalické s viacerými vrstvami) môžu trvať 5–10 dní.",
        },
      },
      {
        "@type": "Question",
        name: "Aká je životnosť epoxidovej podlahy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pri správnej realizácii a údržbe je životnosť epoxidovej podlahy 20+ rokov. Odoláva oderom, chemikáliám, oleju aj záťaži.",
        },
      },
      {
        "@type": "Question",
        name: "Koľko stojí epoxidová podlaha?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hladká jednofarebná od 59 €/m², chipsová od 49 €/m², metalická od 129 €/m². Priemyselné a polyuretánové podlahy cena na dopyt. Presnú kalkuláciu pripravíme po obhliadke.",
        },
      },
      {
        "@type": "Question",
        name: "Realizujete po celom Slovensku?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Áno, realizujeme epoxidové a polyuretánové podlahy po celom Slovensku — od Bratislavy po Košice. Sídlo máme v Ružomberku.",
        },
      },
      {
        "@type": "Question",
        name: "Aký podklad treba pre epoxidovú podlahu?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Najvhodnejší je nový betón vyzretý aspoň 28 dní. Starý betón treba prebrúsiť a otestovať. Existujúcu podlahu (dlažba, vinyl) zvyčajne treba odstrániť. Stav posúdime pri obhliadke.",
        },
      },
      {
        "@type": "Question",
        name: "Sú epoxidové podlahy vhodné do kuchyne?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Áno, bez špár, hygienicky čisté, ľahko sa udržiavajú (mokrý mop). Sú vhodné aj do kúpeľní (s anti-slip variantom), kuchýň aj gastro prevádzok.",
        },
      },
    ],
  };

  // Organization — knowledge panel; prepojené s LocalBusiness cez @id
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: `${SITE.url}/images/site/logo.png` },
    email: SITE.contact.email,
    telephone: SITE.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.countryCode,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.contact.phone,
        email: SITE.contact.email,
        contactType: "sales",
        areaServed: "SK",
        availableLanguage: ["sk"],
      },
    ],
    knowsLanguage: ["sk", "cs", "en"],
    subOrganization: { "@id": `${SITE.url}/#academy` },
    sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.tiktok, SITE.social.youtube].filter(Boolean),
  };

  // WebSite + SearchAction — Google vie vykresliť vyhľadávacie pole v SERP-e
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: "sk-SK",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/eshop?q={search_term_string}#katalog` },
      "query-input": "required name=search_term_string",
    },
  };

  // WebSite node — kotva pre isPartOf na podstránkach + Sitelinks searchbox.
  // /eshop?q=<dopyt> reálne funguje (EshopClient číta ?q), takže SearchAction
  // nie je fikcia.
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    alternateName: SITE.legalName,
    description: SITE.description,
    inLanguage: ["sk-SK", "en"],
    publisher: { "@id": `${SITE.url}/#business` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/eshop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Vzdelávacia vetva firmy — kurz ako samostatná entita napojená na business.
  const academy = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE.url}/#academy`,
    name: "EPOXIDOVO Akadémia",
    url: `${SITE.url}/kurz`,
    description:
      "Dvojdňové praktické kurzy liatych epoxidových podláh v Ružomberku — max. 6 účastníkov v skupine.",
    parentOrganization: { "@id": `${SITE.url}/#business` },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.countryCode,
    },
    telephone: SITE.contact.phone,
    email: SITE.contact.email,
    hasCourse: [
      { "@type": "Course", "@id": `${SITE.url}/kurz#course` },
      { "@type": "Course", "@id": `${SITE.url}/en/epoxy-flooring-course#course` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(academy) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(services) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faq) }}
      />
    </>
  );
}
