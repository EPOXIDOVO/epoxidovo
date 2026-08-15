import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { KalkulatorWizard } from "./KalkulatorWizard";
import { CartBadge } from "../CartBadge";

export const metadata: Metadata = {
  title: "Kalkulátor materiálu — vypočítaj skladbu podlahy",
  description:
    "Krok za krokom: kde, koľko m², aký podklad a vzhľad — kalkulátor prepočíta skladbu na celé balenia a naplní košík. Ceny sú konečné.",
  alternates: { canonical: "/kupit-material/kalkulacka" },
};

interface PageProps {
  searchParams: Promise<{ miesto?: string }>;
}

export default async function KalkulackaEshopPage({ searchParams }: PageProps) {
  const { miesto } = await searchParams;
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Kúpiť materiál", path: "/kupit-material" },
          { name: "Kalkulátor", path: "/kupit-material/kalkulacka" },
        ]}
      />
      <CartBadge />
      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="xl" className="pt-24 md:pt-32 pb-16">
          <h1 className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            Kalkulátor materiálu
          </h1>
          <p className="mt-2 text-center text-zinc-600 max-w-xl mx-auto">
            Prepočíta skladbu vrstvu po vrstve a zaokrúhli na celé balenia —
            presne toľko, koľko reálne kúpiš.
          </p>
          <div className="mt-8">
            <KalkulatorWizard initialMiesto={miesto} />
          </div>
        </Container>
      </div>
    </>
  );
}
