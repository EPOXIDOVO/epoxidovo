import type { Metadata } from "next";
import { KonfiguratorCP } from "@/components/cenova-ponuka/KonfiguratorCP";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { SITE } from "@/lib/site";
import { cenyOdZCrm } from "@/lib/cennik-od";

export const metadata: Metadata = {
  title: "Nezáväzná cenová ponuka",
  description: `Vyklikaj si typ podlahy, prevedenie a plochu — orientačnú cenu uvidíš hneď a ponuku ti pošleme na e-mail. Bezplatne a nezáväzne. ${SITE.contact.phone}.`,
  alternates: { canonical: "/cenova-ponuka" },
};

/**
 * Stránka je ZÁMERNE len konfigurátor — user 2026-08-24: „musi to byt iba
 * ten formular nic ine na tej stranke". Žiadne hero, marquee ani drobčeková
 * lišta; človek prišiel vyklikať cenu, nie čítať. H1 zostáva pre SEO
 * a čítačky, vizuálne ho nesie prvý krok konfigurátora.
 */
export default async function CenovaPonukaPage() {
  // „od" ceny z tej istej matice ako naceňovanie — inak prvý krok hlási
  // iné čísla než na aké konfigurátor reálne vyjde
  const cenyOd = await cenyOdZCrm();

  return (
    <div className="bg-[#f4f5f7] md:flex-1 md:min-h-0 md:overflow-y-auto">
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Cenová ponuka", path: "/cenova-ponuka" },
        ]}
      />
      <h1 className="sr-only">Nezáväzná cenová ponuka na epoxidovú podlahu</h1>
      <div className="mx-auto w-full max-w-3xl px-4 py-5 md:py-8">
        <KonfiguratorCP cenyOd={cenyOd} />
      </div>
    </div>
  );
}
