import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { CategoriesShowcase } from "@/components/home/CategoriesShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Faq } from "@/components/home/Faq";
import { QuoteFormSection } from "@/components/home/QuoteFormSection";
import { Reviews } from "@/components/home/Reviews";

const PAGE_DESCRIPTION =
  "Profesionálne liate epoxidové a polyuretánové podlahy pre domácnosti, garáže, prevádzky a haly. 200+ realizácií, 20+ rokov životnosť. Cenová ponuka zdarma.";

export const metadata: Metadata = {
  title: "Epoxidové a polyuretánové podlahy na mieru | EPOXIDOVO.SK",
  description: PAGE_DESCRIPTION,
  keywords: [
    "epoxidové podlahy",
    "polyuretánové podlahy",
    "liate podlahy",
    "podlahy garáž",
    "priemyselné podlahy",
    "chipsové podlahy",
    "mramorové podlahy",
    "metalické podlahy",
    "epoxid Ružomberok",
    "epoxid Slovensko",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: "https://epoxidovo.sk/",
    siteName: "EPOXIDOVO",
    title: "Epoxidové a polyuretánové podlahy na mieru | EPOXIDOVO.SK",
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "EPOXIDOVO — Epoxidové a polyuretánové podlahy na mieru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Epoxidové a polyuretánové podlahy na mieru | EPOXIDOVO.SK",
    description: PAGE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function HomePage() {
  return (
    <>
      <div className="-mt-20 md:-mt-24">
        <Hero />
      </div>
      <CategoriesShowcase />
      <Stats />
      <HowItWorks />
      <Faq />
      <QuoteFormSection />
      <Reviews />
    </>
  );
}
