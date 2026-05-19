import { SITE } from "@/lib/site";

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
    telephone: SITE.contact.phoneRaw,
    email: SITE.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.countryCode,
    },
    areaServed: {
      "@type": "Country",
      name: "Slovenská republika",
    },
    foundingDate: SITE.business.foundedAt,
    identifier: [
      { "@type": "PropertyValue", propertyID: "IČO", value: SITE.business.icoRaw },
      { "@type": "PropertyValue", propertyID: "DIČ", value: SITE.business.dic },
    ],
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
      // doplníme keď klient pošle social media
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(services) }}
      />
    </>
  );
}
