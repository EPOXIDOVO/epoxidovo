import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/Toast";
import { KonfiguratorClient } from "./KonfiguratorClient";

export const metadata: Metadata = {
  title: "Zisti, aký materiál potrebuješ — skladba, spotreba a cena",
  description:
    "Odpovedz na pár otázok a dostaneš presnú skladbu vrstiev, spotrebu materiálu aj cenu. Epoxidové a polyuretánové podlahy, steny aj schody — interiér aj exteriér.",
  alternates: { canonical: "/navrhni-podlahu" },
};

export default function NavrhniPodlahuPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Zisti, aký materiál potrebuješ", path: "/navrhni-podlahu" },
        ]}
      />
      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="xl" className="pt-5 md:pt-6 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0e1a3b]">
            Zisti, aký materiál potrebuješ
          </h1>
          <p className="mt-1 text-sm md:text-base text-[#4a5478] max-w-2xl mx-auto">
            Odpovedz na pár otázok a dostaneš presnú skladbu vrstiev, spotrebu
            materiálu aj cenu. Trvá to minútu.
          </p>
        </Container>
        <CartProvider>
          <Toaster />
          <KonfiguratorClient />
        </CartProvider>
      </div>
    </>
  );
}
