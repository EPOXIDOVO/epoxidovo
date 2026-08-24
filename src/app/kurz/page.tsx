import type { Metadata } from "next";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { KurzJsonLd } from "@/components/kurz/KurzJsonLd";
import { KurzShell } from "@/components/kurz/landing/KurzShell";
import {
  KURZ,
  KURZ_PROGRAM,
  KURZ_FAQ,
  KURZ_FAKTY,
  KURZ_SUMMARY,
} from "@/content/kurz";

export const metadata: Metadata = {
  title: "Online kurz epoxidových podláh",
  description:
    "Online kurz liatych epoxidových podláh: 8+ hodín videa zo skutočných zákaziek, manuál so spotrebami, kalkulačka, certifikát a prístup navždy. Od 499 €.",
  keywords: [
    "online kurz epoxidových podláh",
    "školenie epoxidové podlahy",
    "kurz liatych podláh",
    "ako robiť epoxidovú podlahu",
    "epoxidové podlahy školenie Slovensko",
    "rekvalifikačný kurz podlahár",
    "kurz metalickej podlahy",
    "kurz chipsových podláh",
    "video kurz liate podlahy",
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
    title: "Online kurz epoxidových podláh",
    description:
      "8+ hodín videa zo skutočných zákaziek, manuál, kalkulačka spotreby a certifikát. Prístup okamžite a navždy. Od 499 €.",
    url: "/kurz",
    images: [{ url: "/og-home.jpg?v=3", width: 1200, height: 630, alt: "Kurz epoxidových podláh EPOXIDOVO Akadémia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kurz epoxidových podláh — EPOXIDOVO Akadémia",
    description: "8+ hodín videa, prístup navždy, certifikát. Od 499 €.",
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
        description="Online video kurz liatych epoxidových podláh: príprava podkladu, jednofarebná liata podlaha, chipsy, metalický efekt, detaily a cenotvorba."
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
      {/* GEO: strojovo čitateľné zhrnutie + fakty ostávajú v HTML (sr-only),
          vizuál je TicketWave landing. */}
      <section className="sr-only" aria-label="Kurz v skratke">
        <p data-speakable>{KURZ_SUMMARY}</p>
        <dl>
          {KURZ_FAKTY.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <KurzShell locale="sk" />
    </>
  );
}
