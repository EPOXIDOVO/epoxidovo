// ?typ= robí zo stránky dynamickú route — Cloudflare Pages ju bez tohto
// odmietne zbuildovať (a spadne celý deploy, nielen táto stránka).
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { RAL_CLASSIC_FULL, RAL_GROUPS } from "@/content/ral-classic";
import { TOPSTONE_METALIK } from "@/content/topstone-metalik";
import { TYPY_PODLAH } from "@/content/typy-podlah";
import { EfektyGrid } from "./EfektyGrid";
import { KombinacieSekcia } from "./KombinacieSekcia";
import { ChipsyKombinacie } from "./ChipsyKombinacie";
import { SpecialneSystemy } from "./SpecialneSystemy";
import { cenyOdZCrm } from "@/lib/cennik-od";
import { MATERIALY } from "@/lib/materialy";
import { obsahKategoria } from "@/lib/obsah-kategorie";
import { ARTURO_TYPY, arturoPreTyp } from "@/content/arturo-farby";
import { ArturoGrid } from "./ArturoGrid";

/**
 * Vzorkovník pre konkrétny typ podlahy — z konfigurátora sem chodí
 * `?typ=`. Jednofarebné majú RAL aj Arturo Unicolor, metalické a mramorové
 * efektové vzorky, chipsové reálne posypy z katalógu a priemyselné namiesto
 * farieb špeciálne systémy (ESD, HACCP, ATEX, protišmyk).
 */
const TYPY: Record<
  string,
  {
    nadpis: string;
    popis: string;
    zdroj: "ral" | "efekty" | "chipsy" | "arturo" | "priprava" | "specialne";
    /** Náhľad do prepínača. Bez fotky sa vykreslí neutrálna dlaždica. */
    foto?: string;
  }
> = {
  jednofarebne: {
    foto: "/images/categories/jednofarebne.jpg",
    nadpis: "Vzorkovník — jednofarebné podlahy",
    popis: "RAL Classic aj odtiene Arturo Unicolor. Vyberáš z tej istej palety, akú miešame do živice.",
    zdroj: "ral",
  },
  priemyselne: {
    foto: "/images/hero/hala.jpg",
    nadpis: "Priemyselné podlahy — špeciálne systémy",
    popis: "ESD, HACCP, ATEX a protišmyk. V priemysle rozhoduje vlastnosť podlahy, nie odtieň — farbu doladíme podľa RAL až nakoniec.",
    zdroj: "specialne",
  },
  metalicke: {
    foto: "/images/categories/metalicke.jpg",
    nadpis: "Vzorkovník — metalické efekty",
    popis: "Reálne vzorky TopStone. Každá liata plocha vyzerá trochu inak — to je podstata efektu.",
    zdroj: "efekty",
  },
  mramorove: {
    foto: "/images/categories/mramorove.jpg",
    nadpis: "Vzorkovník — mramorové efekty",
    popis: "Rovnaké pigmenty ako pri metalike, len iná technika ťahania. Vzory sú orientačné.",
    zdroj: "efekty",
  },
  chipsove: {
    foto: "/images/categories/chipsove.jpg",
    nadpis: "Vzorkovník — chipsové podlahy",
    popis: "Dekoračné vločky, ktoré sa sypú do čerstvej vrstvy. Kombinujú sa so základnou farbou z RAL.",
    zdroj: "chipsy",
  },
  "beton-look": {
    foto: "/images/vzorkovnik/arturo/concrete-look-downtown-mix.webp",
    nadpis: "Vzorkovník — Concrete Look",
    popis: "Odtiene Arturo v radoch Concrete look a Concreta. Vzhľad pohľadového betónu, ale hladký a bezškárový.",
    zdroj: "arturo",
  },
  mistral: {
    foto: "/images/vzorkovnik/arturo/mistral-endless-beach.webp",
    nadpis: "Vzorkovník — Mistral",
    popis: "Rad Mistral od Arturo. Mäkký oblačný ťah s jemnými prechodmi — nie sivý betón, ale pokojná plocha do interiéru.",
    zdroj: "arturo",
  },
  "kamenny-koberec": {
    // reálna vzorka TopStone z katalógu e-shopu (Korfu 4–8 mm)
    foto: "/images/eshop/products/TS-KORFU-4-8-K06.jpg",
    nadpis: "Vzorkovník — kamenný koberec",
    popis: "Mramorové a kremičité kamienky spájané živicou. Vzorkovník kameňov ti pošleme poštou.",
    zdroj: "priprava",
  },
};

/**
 * Dlaždice zoraďujeme presne ako sekcia „Čo všetko vieme vyčarovať".
 * Slugy typov sedia 1:1 s @/content/typy-podlah, takže keď tam typ pribudne
 * alebo sa presunie, vzorkovník ide automaticky s ním. Typy, ktoré
 * v showcase nie sú (kamenný koberec), idú na koniec.
 */
function zoradeneTypy(): [string, (typeof TYPY)[string]][] {
  const podlaShowcase = TYPY_PODLAH.map((t) => t.slug).filter(
    (k): k is string => Boolean(TYPY[k]),
  );
  const zvysok = Object.keys(TYPY).filter((k) => !podlaShowcase.includes(k));
  return [...podlaShowcase, ...zvysok].map((k) => [k, TYPY[k]]);
}

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

/** Reálne vzorky metalických efektov TopStone — zdroj: @/content/topstone-metalik. */
const METALICKE = TOPSTONE_METALIK;


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

  const arturoFarby = typ ? arturoPreTyp(typ) : [];

  const pocet =
    zdroj === "ral"
      ? typ === "jednofarebne"
        ? `${ORDERED_COLORS.length} RAL + ${arturoPreTyp("jednofarebne").length} Arturo`
        : `${ORDERED_COLORS.length} RAL Classic odtieňov`
      : zdroj === "efekty"
        ? `${METALICKE.length} efektov`
        : zdroj === "chipsy"
          ? `${chipsy.length} posypov`
          : zdroj === "arturo"
            ? `${arturoFarby.length} odtieňov`
            : "";

  const cenyOd = await cenyOdZCrm();
  const cenaOdMetalik = cenyOd["metalicke"] ?? null;
  const cenaOdTypu = typ ? (cenyOd[typ] ?? null) : null;

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
          {/* Podnadpis zámerne preč (user 2026-08-25) — typ je vidieť
              z nadpisu aj z dlaždíc s fotkami. `popis` ostáva, ide do
              meta description pre vyhľadávače. */}
        </header>

        {/* Prepínač typov — dlaždice s náhľadovou fotkou, nie holý text
            (user 2026-08-25: „nech vidis tie typy podlah ako fotku
            nahladovu nie ze napis"). */}
        <nav aria-label="Typy vzorkovníkov" className="mb-6">
          {/* 4 v riadku namiesto 7 — pri jemných vzorkách (Mistral, betón
              look) sa na malej dlaždici nedá rozoznať nič (user 2026-08-25). */}
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {zoradeneTypy().map(([slug, t]) => {
              const aktivny = typ === slug;
              return (
                <li key={slug}>
                  <Link
                    href={`/vzorkovnik?typ=${slug}`}
                    // bez scroll={false} by prepnutie typu vyhodilo človeka
                    // späť na začiatok stránky — chce ostať tam, kde bol
                    scroll={false}
                    aria-current={aktivny ? "page" : undefined}
                    className={`group block overflow-hidden rounded-xl ring-2 transition-all ${
                      aktivny
                        ? "ring-[#3db6e8] shadow-[0_8px_22px_rgba(61,182,232,0.28)]"
                        : "ring-transparent hover:ring-[#3db6e8]/60 hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="relative block aspect-[4/3] bg-zinc-100">
                      {t.foto ? (
                        <Image
                          src={t.foto}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 50vw, 320px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                          Foto čoskoro
                        </span>
                      )}
                    </span>
                    <span
                      className={`block px-2 py-2 text-center text-xs md:text-sm font-bold leading-tight ${
                        aktivny ? "bg-[#3db6e8] text-[#0e1a3b]" : "bg-zinc-100 text-[#1B2430]/75"
                      }`}
                    >
                      {t.nadpis.replace("Vzorkovník — ", "")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

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

        {/* prvá sekcia pri metalických — ukážky kombinácií */}
        {typ === "metalicke" && <KombinacieSekcia />}

        {zdroj === "efekty" && <EfektyGrid cenaOd={cenaOdMetalik} />}

        {/* Arturo Unicolor patrí k jednofarebným — je to iná paleta toho
            istého typu podlahy, nie samostatný druh. */}
        {typ === "jednofarebne" && arturoFarby.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Arturo Unicolor
            </h2>
            <p className="mt-1 mb-4 text-sm text-[#1B2430]/65 max-w-2xl">
              Hotové odtiene od Arturo — namiešané výrobcom, takže farba sedí
              presne. Alternatíva k miešaniu podľa RAL.
            </p>
            <ArturoGrid typy={ARTURO_TYPY} farby={arturoFarby} cenaOd={cenaOdTypu} />
          </section>
        )}

        {typ === "chipsove" && <ChipsyKombinacie />}

        {zdroj === "specialne" && <SpecialneSystemy />}

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

        {zdroj === "arturo" && <ArturoGrid typy={ARTURO_TYPY} farby={arturoFarby} cenaOd={cenaOdTypu} />}

        {zdroj === "priprava" && (
          <div className="rounded-2xl border border-zinc-200 bg-[#f7f6f3] p-6 md:p-8 text-center">
            <p className="text-[#1B2430]/80 max-w-xl mx-auto">
              Vzorkovník Concrete Look ešte fotíme. Zavolaj nám alebo napíš a pošleme ti
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
