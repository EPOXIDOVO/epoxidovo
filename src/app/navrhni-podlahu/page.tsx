import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/Toast";
import { KonfiguratorClient } from "./KonfiguratorClient";

export const metadata: Metadata = {
  title: "Navrhni si podlahu — skladba, spotreba a cena za minútu",
  description:
    "Odpovedz na 6 otázok a dostaneš presnú skladbu vrstiev, spotrebu materiálu aj cenu. Epoxidové a polyuretánové podlahy, steny aj schody — interiér aj exteriér.",
  alternates: { canonical: "/navrhni-podlahu" },
};

export default function NavrhniPodlahuPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Navrhni si podlahu", path: "/navrhni-podlahu" },
        ]}
      />
      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="xl" className="pt-8 md:pt-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0e1a3b]">
            Navrhni si podlahu
          </h1>
          <p className="mt-2 text-[#4a5478] max-w-2xl">
            Odpovedz na 6 otázok a dostaneš presnú skladbu vrstiev, spotrebu
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
