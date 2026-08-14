import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { EshopClient } from "./EshopClient";
import { MATERIALY } from "@/lib/materialy";

export const metadata: Metadata = {
  title: "E-shop — epoxidové materiály Sika a TopStone",
  description:
    "Profesionálne epoxidové materiály, ktoré používame na vlastných realizáciách — penetrácie, hlavné vrstvy, vrchné laky, pigmenty, chipsy a kremičité piesky. Sika a TopStone, konečné ceny.",
  alternates: { canonical: "/eshop" },
};

/**
 * E-shop — katalóg materiálov (Sika + TopStone) z CRM exportu.
 * Ceny sú finálne (neplatiteľ DPH). Objednávka zatiaľ cez telefón/email
 * z detailu produktu — bez košíka.
 */
export default function EshopPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "E-shop", path: "/eshop" },
        ]}
      />
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 0%, rgba(61,182,232,0.22), transparent 75%)",
          }}
        />
        <Container size="xl" className="pt-24 md:pt-32 pb-10 md:pb-14 relative text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Materiály a náradie
            <br />
            <span className="text-[#3db6e8]">na epoxidové podlahy</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            {MATERIALY.length} produktov Sika a TopStone — presne tie, ktoré
            používame na vlastných realizáciách. Konečné ceny, predaj v celých
            baleniach.
          </p>
        </Container>
      </section>

      <div className="bg-[#f7f7f4]">
        <EshopClient />
      </div>
    </>
  );
}
