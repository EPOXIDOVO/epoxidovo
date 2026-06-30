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
      ratingValue: "5.0",
      reviewCount: "28",
      bestRating: "5",
      worstRating: "1",
    },
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
            name: "Mramorové epoxidové efekty",
            description: "Ručne tvorené žilkovanie — každá podlaha je originál.",
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
          text: "Bežná podlaha do 50 m² trvá 3–5 dní vrátane prípravy podkladu, aplikácie a vytvrdnutia. Komplikovanejšie projekty (mramorové, metalické s viacerými vrstvami) môžu trvať 5–10 dní.",
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
          text: "Hladká jednofarebná od 70 €/m², chipsová od 49 €/m², mramorová od 139 €/m², metalická od 129 €/m². Priemyselné a polyuretánové podlahy cena na dopyt. Presnú kalkuláciu pripravíme po obhliadke.",
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

  return (
    <>
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
