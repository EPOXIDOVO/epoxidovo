import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { RAL_CLASSIC_FULL, RAL_GROUPS } from "@/content/ral-classic";

export const metadata: Metadata = {
  title: "Vzorkovník farieb — RAL Classic",
  description:
    "Kompletný RAL Classic vzorkovník. Vyber si farbu svojej epoxidovej podlahy z 50+ overených RAL odtieňov.",
  alternates: { canonical: "/vzorkovnik" },
};

// Zoradenie podľa RAL_GROUPS poradia, ale renderované v jednom plynulom gride
// (ako reálny papierový vzorkovník — všetko vidno na jednej obrazovke).
const ORDERED_COLORS = RAL_GROUPS.flatMap((g) =>
  RAL_CLASSIC_FULL.filter((c) => c.skupina === g.key),
);

export default function VzorkovnikPage() {
  return (
    <div className="bg-white">
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Vzorkovník farieb", path: "/vzorkovnik" },
        ]}
      />

      <Container size="xl" className="py-8 md:py-10">
        {/* Kompaktný header */}
        <header className="mb-5 md:mb-6">
          <nav
            aria-label="Breadcrumb"
            className="text-xs md:text-sm font-bold text-[#1B2430]/60 mb-2"
          >
            <ol className="inline-flex items-center gap-1.5">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#3db6e8] transition-colors"
                >
                  Domov
                </Link>
              </li>
              <li aria-hidden className="text-[#1B2430]/30">/</li>
              <li className="text-[#3db6e8]">Vzorkovník farieb</li>
            </ol>
          </nav>
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1B2430]">
              Vzorkovník farieb
            </h1>
            <p className="text-xs md:text-sm font-bold text-[#1B2430]/60">
              {ORDERED_COLORS.length} RAL Classic odtieňov
            </p>
          </div>
        </header>

        {/* Kompaktný grid — všetky farby v jednom plynulom layoute, ako papierový
            RAL vzorkovník. Bez veľkých sekcií, minimálne labels. */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 md:gap-2.5">
          {ORDERED_COLORS.map((c) => (
            <div
              key={c.kod}
              title={`${c.kod} · ${c.nazov}`}
              className="group"
            >
              <div
                className="aspect-square rounded-md ring-1 ring-[#1B2430]/10 transition-transform group-hover:scale-105 group-hover:ring-[#3db6e8] group-hover:shadow-md"
                style={{ backgroundColor: c.hex }}
              />
              <div className="mt-1 text-center leading-tight">
                <div className="text-[10px] md:text-[11px] font-black text-[#1B2430]">
                  {c.kod.replace("RAL ", "")}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — kompaktný odkaz na cenovú ponuku */}
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="text-sm md:text-base font-bold text-[#1B2430]/70">
            Vybral si farbu?
          </span>
          <Link
            href="/cenova-ponuka"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F0851A] text-white font-semibold text-sm md:text-base hover:bg-[#D9760F] shadow-[0_8px_24px_rgba(240,133,26,0.4)] hover:-translate-y-0.5 transition-all"
          >
            Nezáväzná cenová ponuka
          </Link>
        </div>
      </Container>
    </div>
  );
}
