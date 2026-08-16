import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { EshopClient } from "../EshopClient";
import { MATERIALY } from "@/lib/materialy";

export const metadata: Metadata = {
  title: "Katalóg podľa výrobcu — Sika, TopStone, Arturo a UZIN",
  description:
    "Celý katalóg materiálov s filtrom podľa výrobcu aj účelu — penetrácie, hlavné vrstvy, laky, nivelácie, náradie. Sika, TopStone, Arturo a UZIN.",
  alternates: { canonical: "/eshop/znacky" },
};

/**
 * Katalóg s bočným stĺpcom výrobcov (klasické rozdelenie) — na hlavnom
 * /eshop je filter značiek vypnutý, tu je zapnutý cez prop.
 */
export default function ZnackyPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "E-shop", path: "/eshop" },
          { name: "Podľa výrobcu", path: "/eshop/znacky" },
        ]}
      />
      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="xl" className="pt-6">
          <a
            href="/eshop"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Späť na e-shop
          </a>
          <h1 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight text-[#0e1a3b]">
            Katalóg podľa výrobcu
          </h1>
          <p className="mt-1.5 text-[#4a5478] max-w-2xl">
            {MATERIALY.length} produktov štyroch značiek, ktoré sami lejeme na
            realizáciách. Vľavo vyber výrobcu, hore účel — penetrácia, hlavná
            vrstva, lak či nivelácia.
          </p>
        </Container>
        <EshopClient sidebarVyrobcov />
      </div>
    </>
  );
}
