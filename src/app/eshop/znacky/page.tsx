import type { Metadata } from "next";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { MATERIALY, VYROBCOVIA } from "@/lib/materialy";
import { VYROBCA_LOGO } from "@/lib/vyrobca-logo";

export const metadata: Metadata = {
  title: "Značky — Sika, TopStone, Arturo a UZIN",
  description:
    "Materiály štyroch značiek, ktoré sami používame na realizáciách: Sika, TopStone, Arturo a UZIN. Vyber si značku a prezri celý sortiment.",
  alternates: { canonical: "/eshop/znacky" },
};

/** Krátke predstavenie každej značky — prečo ju máme v ponuke. */
const POPIS: Record<string, string> = {
  Sika: "Švajčiarska jednotka v priemyselných podlahách. Epoxidy Sikafloor, nivelačné hmoty a systémy, ktoré držia v halách aj garážach desiatky rokov.",
  TopStone: "Český špecialista na liate a dekoratívne podlahy — kamenné koberce, metalické stierky a kompletná chémia od penetrácie po lak.",
  Arturo: "Holandská značka dizajnových liatych podláh. Polyuretánové a epoxidové stierky s dôrazom na vzhľad, pružnosť a nízke emisie.",
  UZIN: "Nemecký expert na prípravu podkladu — penetrácie, samonivelačné stierky a rýchle potery pre bezchybný základ pod každú podlahu.",
};

export default function ZnackyPage() {
  const pocty = new Map<string, number>();
  for (const m of MATERIALY) pocty.set(m.vyrobca, (pocty.get(m.vyrobca) ?? 0) + 1);

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "E-shop", path: "/eshop" },
          { name: "Značky", path: "/eshop/znacky" },
        ]}
      />
      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="xl" className="py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0e1a3b]">
            Vyber si podľa značky
          </h1>
          <p className="mt-2 text-[#4a5478] max-w-2xl">
            {MATERIALY.length} produktov od štyroch výrobcov, ktorých materiál
            sami lejeme na realizáciách. Klikni na značku a uvidíš celý jej
            sortiment.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {VYROBCOVIA.map((v) => (
              <a
                key={v}
                href={`/eshop?vyrobca=${encodeURIComponent(v)}#katalog`}
                className="group rounded-3xl border border-zinc-200 bg-white p-6 md:p-7 flex items-center gap-5 hover:border-[#3db6e8] hover:shadow-[0_14px_36px_rgba(0,0,0,0.1)] transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={VYROBCA_LOGO[v]}
                  alt={`${v} logo`}
                  className="h-12 w-28 object-contain object-left shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-[#0e1a3b]">{v}</span>
                    <span className="text-sm font-semibold text-zinc-400 tabular-nums whitespace-nowrap">
                      {pocty.get(v) ?? 0} produktov
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-zinc-500 leading-relaxed">
                    {POPIS[v]}
                  </span>
                </span>
                <ChevronRight className="w-5 h-5 shrink-0 text-zinc-300 group-hover:text-[#3db6e8] transition-colors" aria-hidden />
              </a>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-[#0e1a3b] text-white p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-lg font-extrabold">Nevieš, ktorú značku zvoliť?</div>
              <div className="mt-1 text-sm text-white/70">
                Zavolaj nám — poradíme podľa priestoru, záťaže a rozpočtu. Zadarmo.
              </div>
            </div>
            <a
              href="/eshop#katalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f97316] text-white font-bold hover:bg-[#ea580c] transition-colors whitespace-nowrap"
            >
              Prezrieť celý katalóg
            </a>
          </div>
        </Container>
      </div>
    </>
  );
}
