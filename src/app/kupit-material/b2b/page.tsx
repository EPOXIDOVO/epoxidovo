import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { B2bForm } from "./B2bForm";

export const metadata: Metadata = {
  title: "B2B — veľkoobchod pre realizačné firmy",
  description:
    "Registrácia pre realizačné firmy cez IČO. Po manuálnom schválení získate veľkoobchodné podmienky na materiály Sika, TopStone, Arturo a UZIN.",
  alternates: { canonical: "/kupit-material/b2b" },
};

/**
 * FÁZA 4 — B2B registrácia s ručným schválením.
 * Veľkoobchodné ceny sa neprihlásenému návštevníkovi NIKDY neservírujú —
 * priceTrade nie je v žiadnom klientskom bundli (server-only dáta).
 * Login + zobrazenie trade cien sa aktivuje po naplnení cien.
 */
export default function B2bPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Kúpiť materiál", path: "/kupit-material" },
          { name: "B2B", path: "/kupit-material/b2b" },
        ]}
      />
      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="md" className="pt-24 md:pt-32 pb-16">
          <h1 className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            Pre realizačné firmy
          </h1>
          <p className="mt-3 text-center text-zinc-600 max-w-xl mx-auto">
            Robíte podlahy? Zaregistrujte firmu cez IČO — po overení a
            schválení získate veľkoobchodné podmienky a prioritnú dostupnosť
            materiálu.
          </p>
          <div className="mt-8 max-w-md mx-auto">
            <B2bForm />
          </div>
          <p className="mt-6 text-center text-xs text-zinc-400 max-w-md mx-auto">
            Účet aktivujeme manuálne po overení firmy. Veľkoobchodné ceny sú
            dostupné až po prihlásení schváleného účtu.
          </p>
        </Container>
      </div>
    </>
  );
}
