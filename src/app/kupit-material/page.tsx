import type { Metadata } from "next";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/Toast";
import { ObjednavkaMaterialu } from "./ObjednavkaMaterialu";
import { DOPRAVA_ZADARMO } from "@/lib/payments";
import { ESHOP_SPUSTENY } from "@/lib/flags";

// Kým e-shop nebeží, jeho stránky nesmú byť v indexe: objednávka sa nedá
// dokončiť, no Product schéma sľubuje InStock a cenu. Zo sitemapy sú už
// vonku, to ale nedeindexuje nič — na to treba noindex. follow ostáva,
// nech sa interná linková sila nestratí. Spustením e-shopu to zmizne samo.
const ROBOTS_ESHOP = ESHOP_SPUSTENY ? undefined : { index: false, follow: true };


export const metadata: Metadata = {
    robots: ROBOTS_ESHOP,
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
