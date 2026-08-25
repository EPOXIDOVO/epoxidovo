import type { Metadata } from "next";
import { PonukaLanding } from "./PonukaLanding";

/**
 * /ponuka — landing page pre platenú Facebook / Instagram reklamu.
 *
 * Zámerne bez hlavičky, pätičky a odkazov preč zo stránky: jediná cesta
 * vedie do formulára. Lead ide cez POST /api/lead → BDSManager CRM.
 *
 * noindex: nechceme, aby táto stránka konkurovala organickým stránkam
 * (/cenova-ponuka, /epoxidove-podlahy) vo vyhľadávaní. Je to čisto
 * destinácia pre reklamu.
 */
export const metadata: Metadata = {
  title: "Epoxidová podlaha na mieru — cenová ponuka do 24 hodín | EPOXIDOVO",
  description:
    "Metalické, mramorové a jednofarebné epoxidové podlahy. Vyplň formulár a do 24 hodín ti pošleme cenovú ponuku na mieru. Realizácie po celom Slovensku.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/ponuka" },
  openGraph: {
    title: "Epoxidová podlaha na mieru — cenová ponuka do 24 hodín",
    description:
      "Vyplň krátky formulár a ozveme sa ti do 24 hodín s cenou na mieru.",
    images: [
      { url: "/images/categories/metalicke.jpg", width: 1200, height: 800 },
    ],
  },
};

export default function PonukaPage() {
  return <PonukaLanding />;
}
