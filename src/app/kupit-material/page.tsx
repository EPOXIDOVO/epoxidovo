import type { Metadata } from "next";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/Toast";
import { ObjednavkaMaterialu } from "./ObjednavkaMaterialu";
import { DOPRAVA_ZADARMO } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Objednať materiál na liatu podlahu — zostav si set na mieru | EPOXIDOVO",
  // „doprava v cene" tu sľubovala niečo, čo pri ťažkom sete neplatí — text
  // ťaháme z payments.ts, nech sa sľub nikde nerozíde.
  description:
    `Vyber systém, odtieň a výmeru — dostaneš presný set materiálu s cenou. Voliteľne nivelácia, tmel na praskliny a náradie. Konečné ceny. ${DOPRAVA_ZADARMO.kratko}.`,
  alternates: { canonical: "/kupit-material" },
};

export default function KupitMaterialPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Objednať materiál", path: "/kupit-material" },
        ]}
      />
      <CartProvider>
        <Toaster />
        <ObjednavkaMaterialu />
      </CartProvider>
    </>
  );
}
