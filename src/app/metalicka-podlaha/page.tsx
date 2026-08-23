import type { Metadata } from "next";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/Toast";
import { MetalikLanding } from "./MetalikLanding";

export const metadata: Metadata = {
  title: "Metalická epoxidová podlaha — materiál na svojpomoc | EPOXIDOVO",
  description:
    "Kúp si kompletný set na metalickú podlahu: TopStone EP02 + EP11 Metallic + EP22 Plus. Presný rozpis na tvoje m², návod krok za krokom, 18 efektov, konečné ceny bez DPH navyše.",
  alternates: { canonical: "/metalicka-podlaha" },
  openGraph: {
    title: "Metalická epoxidová podlaha — zvládneš ju aj sám",
    description: "Set na metalickú podlahu s návodom. Vyber efekt, zadaj m², pošleme presne toľko materiálu, koľko treba.",
    images: [{ url: "/images/categories/metalicke.jpg", width: 1200, height: 800 }],
  },
};

export default function MetalickaPodlahaPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Metalická podlaha", path: "/metalicka-podlaha" },
        ]}
      />
      <CartProvider>
        <Toaster />
        <MetalikLanding />
      </CartProvider>
    </>
  );
}
