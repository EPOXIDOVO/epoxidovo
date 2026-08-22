// ?typ= robí zo stránky dynamickú route — Cloudflare Pages ju bez tohto
// odmietne zbuildovať (a spadne celý deploy, nielen táto stránka).
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { RAL_CLASSIC_FULL, RAL_GROUPS } from "@/content/ral-classic";
import { MATERIALY } from "@/lib/materialy";
import { obsahKategoria } from "@/lib/obsah-kategorie";
import { ARTURO_FARBY, ARTURO_TYPY } from "@/content/arturo-farby";
import { ArturoGrid } from "./ArturoGrid";

/**
 * Vzorkovník pre konkrétny typ podlahy — z konfigurátora sem chodí
 * `?typ=`. Jednofarebné a priemyselné majú RAL, metalické a mramorové
 * efektové vzorky, chipsové reálne posypy z katalógu.
 */
const TYPY: Record<
  string,
  { nadpis: string; popis: string; zdroj: "ral" | "efekty" | "chipsy" | "arturo" | "priprava" }
> = {
  jednofarebne: {
    nadpis: "Vzorkovník — jednofarebné podlahy",
    popis: "RAL Classic. Odtieň si vyberáš z tej istej palety, akú miešame do živice.",
    zdroj: "ral",
  },
  priemyselne: {
    nadpis: "Vzorkovník — priemyselné podlahy",
    popis: "RAL Classic. Do hál a dielní sa najčastejšie lejú sivé a modré odtiene.",
    zdroj: "ral",
  },
  metalicke: {
    nadpis: "Vzorkovník — metalické efekty",
    popis: "Reálne vzorky TopStone. Každá liata plocha vyzerá trochu inak — to je podstata efektu.",
    zdroj: "efekty",
  },
  mramorove: {
    nadpis: "Vzorkovník — mramorové efekty",
    popis: "Rovnaké pigmenty ako pri metalike, len iná technika ťahania. Vzory sú orientačné.",
    zdroj: "efekty",
  },
  chipsove: {
    nadpis: "Vzorkovník — chipsové podlahy",
    popis: "Dekoračné vločky, ktoré sa sypú do čerstvej vrstvy. Kombinujú sa so základnou farbou z RAL.",
    zdroj: "chipsy",
  },
  arturo: {
    nadpis: "Vzorkovník — Arturo",
    popis: "Kompletná farebná škála Arturo — 68 odtieňov v radoch Unicolor, Concrete look, Mistral, Microcement a Concreta.",
    zdroj: "arturo",
  },
  "kamenny-koberec": {
    nadpis: "Vzorkovník — kamenný koberec",
    popis: "Mramorové a kremičité kamienky spájané živicou. Vzorkovník kameňov ti pošleme poštou.",
    zdroj: "priprava",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ typ?: string }>;
}): Promise<Metadata> {
  const { typ } = await searchParams;
  const v = typ ? TYPY[typ] : null;
  return {
    title: v ? v.nadpis : "Vzorkovník farieb — RAL, TopStone metalik, Arturo",
    description: v
      ? v.popis
      : "Vzorkovník epoxidových podláh: 213 odtieňov RAL Classic, metalické efekty TopStone a 68 odtieňov Arturo. Vyber si farbu, my dopočítame materiál.",
    // každý typ je vlastná stránka, nech sa neberú ako duplikát
    alternates: { canonical: typ && TYPY[typ] ? `/vzorkovnik?typ=${typ}` : "/vzorkovnik" },
  };
}

// Zoradenie podľa RAL_GROUPS poradia, ale renderované v jednom plynulom gride
// (ako reálny papierový vzorkovník — všetko vidno na jednej obrazovke).
const ORDERED_COLORS = RAL_GROUPS.flatMap((g) =>
  RAL_CLASSIC_FULL.filter((c) => c.skupina === g.key),
);

/** Reálne vzorky metalických efektov TopStone. */
const METALICKE = [
  { id: "sequoia", label: "Sequoia" },
  { id: "charcoal", label: "Charcoal" },
  { id: "azuro", label: "Azuro" },
  { id: "copper", label: "Copper" },
  { id: "pearl", label: "Pearl" },
  { id: "slate", label: "Slate" },
  { id: "gold", label: "Gold" },
  { id: "midnight-blue", label: "Midnight Blue" },
  { id: "moose-green", label: "Moose Green" },
  { id: "wine-red", label: "Wine Red" },
  { id: "white", label: "White" },
  { id: "gun-metal", label: "Gun Metal" },
];


export default async function VzorkovnikPage({
  searchParams,
}: {
  searchParams: Promise<{ typ?: string }>;
}) {
  const { typ } = await searchParams;
  const v = (typ && TYPY[typ]) || null;
  const nadpis = v?.nadpis ?? "Vzorkovník farieb";
  const zdroj = v?.zdroj ?? "ral";

  const chipsy = MATERIALY.filter((m) => obsahKategoria(m) === "chipsy");

  const arturoFarby = ARTURO_FARBY;

  const pocet =
    zdroj === "ral"
      ? `${ORDERED_COLORS.length} RAL Classic odtieňov`
      : zdroj === "efekty"
        ? `${METALICKE.length} efektov`
        : zdroj === "chipsy"
          ? `${chipsy.length} posypov`
          : zdroj === "arturo"
            ? `${arturoFarby.length} odtieňov`
            : "";

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
                <Link href="/" className="hover:text-[#12729f] transition-colors">
                  Domov
                </Link>
              </li>
              <li aria-hidden className="text-[#1B2430]/30">/</li>
              <li className="text-[#12729f]">Vzorkovník farieb</li>
            </ol>
          </nav>
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1B2430]">
              {nadpis}
            </h1>
            {pocet && (
              <p className="text-xs md:text-sm font-bold text-[#1B2430]/60">{pocet}</p>
            )}
          </div>
          {v && <p className="mt-2 text-sm md:text-base text-[#1B2430]/70 max-w-2xl">{v.popis}</p>}
        </header>

        {/* prepínač typov — nech sa dá preskákať medzi vzorkovníkmi */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(TYPY).map(([slug, t]) => (
            <Link
              key={slug}
              href={`/vzorkovnik?typ=${slug}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                typ === slug
                  ? "bg-[#3db6e8] text-[#0e1a3b]"
                  : "bg-zinc-100 text-[#1B2430]/70 hover:bg-zinc-200"
              }`}
            >
              {t.nadpis.replace("Vzorkovník — ", "")}
            </Link>
          ))}
        </div>

        {zdroj === "ral" && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 md:gap-2.5">
            {ORDERED_COLORS.map((c) => (
              <div key={c.kod} title={`${c.kod} · ${c.nazov}`} className="group">
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
        )}

        {zdroj === "efekty" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {METALICKE.map((e) => (
              <div key={e.id} className="group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-[#1B2430]/10 group-hover:ring-[#3db6e8] transition-all">
                  <Image
                    src={`/images/eshop/topstone-metallic/${e.id}.jpg`}
                    alt={`Metalický efekt ${e.label}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={85}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-1.5 text-sm font-bold text-[#1B2430]">{e.label}</div>
              </div>
            ))}
          </div>
        )}

        {zdroj === "chipsy" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {chipsy.map((m) => (
              <Link key={m.sku} href={`/eshop/${m.sku}`} className="group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-[#1B2430]/10 group-hover:ring-[#3db6e8] transition-all bg-zinc-100">
                  {m.foto ? (
                    <Image
                      src={m.foto}
                      alt={m.nazov}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      quality={85}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-zinc-400">
                      Fotka sa dopĺňa
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-sm font-bold text-[#1B2430] leading-snug">
                  {m.nazov}
                </div>
              </Link>
            ))}
          </div>
        )}

        {zdroj === "arturo" && <ArturoGrid typy={ARTURO_TYPY} farby={arturoFarby} />}

        {zdroj === "priprava" && (
          <div className="rounded-2xl border border-zinc-200 bg-[#f7f6f3] p-6 md:p-8 text-center">
            <p className="text-[#1B2430]/80 max-w-xl mx-auto">
              Vzorkovník betón look ešte fotíme. Zavolaj nám alebo napíš a pošleme ti
              reálne vzorky, aby si videl štruktúru naživo.
            </p>
            <Link
              href="/kontakt"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3db6e8] text-[#0e1a3b] font-bold text-sm hover:bg-[#1a8cc4] transition-colors"
            >
              Vypýtať vzorky
            </Link>
          </div>
        )}

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
