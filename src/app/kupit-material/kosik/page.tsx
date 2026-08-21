import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { getPaymentMethods } from "@/lib/payments";
import { KosikClient } from "./KosikClient";

export const metadata: Metadata = {
  title: "Košík a objednávka",
  description:
    "Dokonči objednávku materiálu — osobný odber v Komjatnej alebo kuriér, platba prevodom, dobierkou alebo kartou.",
  alternates: { canonical: "/kupit-material/kosik" },
  robots: { index: false },
};

export default function KosikPage() {
  // server-side: karta sa ponúkne len keď je Stripe nakonfigurovaný
  const paymentMethods = getPaymentMethods();

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Kúpiť materiál", path: "/kupit-material" },
          { name: "Košík", path: "/kupit-material/kosik" },
        ]}
      />
      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="xl" className="pt-8 md:pt-12 pb-16">
          {/* stránka musí mať h1 — pre čítačky aj SEO */}
          <h1 className="sr-only">Košík</h1>
          <KosikClient paymentMethods={paymentMethods} />
        </Container>
      </div>
    </>
  );
}
