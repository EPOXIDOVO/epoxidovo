import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Mail, Phone, Lock, Truck, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { SITE } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { DOPRAVA_ZADARMO } from "@/lib/payments";
import {
  MATERIALY,
  getMaterial,
  PIESOK_SKUS,
  PU_2MM_SKUS,
  referencnaFotka,
  texturaProVizualizer,
} from "@/lib/materialy";
import { ProductVisual } from "@/components/eshop/ProductVisual";
import {
  TOPSTONE_METALLIC_VZORY,
  METALLIC_VZORY_SKUS,
} from "@/content/topstone-metallic-vzory";
import { BaleniaKalkulacka } from "./BaleniaKalkulacka";
import { HrubkaKalkulacka } from "./HrubkaKalkulacka";
import { RalNahlad } from "./RalNahlad";
import { KombinujSystem } from "./KombinujSystem";
import { PorovnanieCien } from "./PorovnanieCien";
import { PridatDoKosika, type SkladbaPolozka } from "./PridatDoKosika";

interface PageProps {
  params: Promise<{ sku: string }>;
}

export function generateStaticParams() {
  return MATERIALY.map((m) => ({ sku: m.sku }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku } = await params;
  const m = getMaterial(sku);
  if (!m) return {};
  const desc = [
    `${m.nazov} — ${m.kategoria.toLowerCase()}, ${m.vyrobca}.`,
    m.balenie ? `Balenie ${m.balenie}.` : null,
    m.pokryje_m2_z_balenia != null ? `Vystačí na ${String(m.pokryje_m2_z_balenia).replace(".", ",")} m².` : null,
    m.cena_eur_s_dph > 0 ? `Konečná cena ${m.cena_eur_s_dph.toFixed(2)} €.` : "Cena na dopyt — pripravíme individuálnu ponuku.",
  ]
    .filter(Boolean)
    .join(" ");
  const ogFoto = m.foto ?? m.foto_sud ?? "/og-home.jpg";
  const cenaText = m.cena_eur_s_dph > 0 ? `${m.cena_eur_s_dph.toFixed(2).replace(".", ",")} €` : "cena na dopyt";
  const titul = `${m.nazov} — ${cenaText} | ${m.vyrobca}`;
  return {
    title: titul,
    description: desc,
    alternates: { canonical: `/eshop/${m.sku}` },
    openGraph: {
      type: "website",
      url: `/eshop/${m.sku}`,
      title: titul,
      description: desc,
      images: [{ url: ogFoto, width: 1200, height: 630, alt: m.nazov }],
    },
  };
}

function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export default async function ProduktPage({ params }: PageProps) {
  const { sku } = await params;
  const m = getMaterial(sku);
  if (!m) notFound();

  const refFoto = referencnaFotka(m);
  const jePu = PU_2MM_SKUS.includes(m.sku);

  // Odporúčaná skladba do košíka — vrstvy od rovnakého výrobcu v poradí
  // aplikácie; vrchný lak sa nepridáva, ak JE produkt poslednou vrstvou.
  const doKosika: SkladbaPolozka = {
    sku: m.sku,
    nazov: m.nazov,
    cena: m.cena_eur_s_dph,
    foto: m.foto,
    krok:
      m.kategoria === "Penetrácia"
        ? "1. Penetrácia"
        : m.kategoria === "Vrchný lak"
          ? "3. Vrchný lak"
          : "2. Hlavná vrstva",
  };
  const prvy = (kat: string): SkladbaPolozka | null => {
    const p = MATERIALY.find(
      (x) => x.vyrobca === m.vyrobca && x.kategoria === kat && x.sku !== m.sku && x.cena_eur_s_dph > 0,
    );
    return p
      ? { sku: p.sku, nazov: p.nazov, cena: p.cena_eur_s_dph, foto: p.foto,
          krok: kat === "Penetrácia" ? "1. Penetrácia" : kat === "Vrchný lak" ? "3. Vrchný lak" : "2. Hlavná vrstva" }
      : null;
  };
  let skladba: SkladbaPolozka[] = [doKosika];
  if (m.kategoria === "Hlavná vrstva") {
    skladba = [prvy("Penetrácia"), doKosika, prvy("Vrchný lak")].filter(Boolean) as SkladbaPolozka[];
  } else if (m.kategoria === "Penetrácia") {
    skladba = [doKosika, prvy("Hlavná vrstva"), prvy("Vrchný lak")].filter(Boolean) as SkladbaPolozka[];
  } else if (m.kategoria === "Vrchný lak") {
    skladba = [prvy("Penetrácia"), prvy("Hlavná vrstva"), doKosika].filter(Boolean) as SkladbaPolozka[];
  }
  const piesky = m.kategoria === "Hlavná vrstva"
    ? PIESOK_SKUS.map((s) => getMaterial(s)).filter(
        (p): p is NonNullable<typeof p> => p != null,
      )
    : [];

  // Technické údaje — riadok sa zobrazí LEN keď hodnota existuje
  const techRows: { label: string; value: string }[] = [];
  if (m.spracovatelnost_min != null)
    techRows.push({ label: "Spracovateľnosť po zmiešaní", value: `${m.spracovatelnost_min} min` });
  if (m.dalsia_vrstva_od_h != null || m.dalsia_vrstva_do_h != null) {
    const od = m.dalsia_vrstva_od_h;
    const doH = m.dalsia_vrstva_do_h;
    techRows.push({
      label: "Ďalšia vrstva",
      value: od != null && doH != null ? `po ${od}–${doH} h` : od != null ? `po ${od} h` : `do ${doH} h`,
    });
  }
  if (m.pochodzne_h != null)
    techRows.push({ label: "Pochôdzne", value: `po ${m.pochodzne_h} h` });
  if (m.plne_vytvrdnute_dni != null)
    techRows.push({ label: "Plné vytvrdnutie", value: `${m.plne_vytvrdnute_dni} dní` });
  if (m.vyzaduje_podklad_mpa != null)
    techRows.push({ label: "Pevnosť podkladu min.", value: `${m.vyzaduje_podklad_mpa} MPa` });

  // Product JSON-LD — cena je konečná (neplatiteľ DPH)
  // Bez image + description Google produktový snippet (cena v SERP) neukáže.
  // Fallback na brandový obrázok — bez image Google neukáže cenový snippet
  // (user 2026-08-27: SEO na VŠETKY produkty).
  const fotoAbs = m.foto ?? m.foto_sud ?? "/og-home.jpg";
  const popisSchema = [
    `${m.nazov} — ${m.kategoria.toLowerCase()}, ${m.vyrobca}.`,
    m.balenie ? `Balenie ${m.balenie}.` : null,
    m.spotreba_kg_m2 != null ? `Spotreba cca ${String(m.spotreba_kg_m2).replace(".", ",")} kg/m².` : null,
    m.pokryje_m2_z_balenia != null ? `Vystačí na ${String(m.pokryje_m2_z_balenia).replace(".", ",")} m².` : null,
    "Konečná cena, nie sme platiteľmi DPH.",
  ].filter(Boolean).join(" ");
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE.url}/eshop/${m.sku}/#product`,
    name: m.nazov,
    sku: m.sku,
    mpn: m.sku,
    description: popisSchema,
    image: [`${SITE.url}${fotoAbs}`],
    brand: { "@type": "Brand", name: m.vyrobca },
    category: m.kategoria,
    url: `${SITE.url}/eshop/${m.sku}`,
    // Na dopyt (cena 0) = bez offers, aby v SERP nesvietilo fiktívne 0 €.
    ...(m.cena_eur_s_dph > 0
      ? {
          offers: {
            "@type": "Offer",
            url: `${SITE.url}/eshop/${m.sku}`,
            priceCurrency: "EUR",
            price: m.cena_eur_s_dph,
            priceValidUntil,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: SITE.legalName, url: SITE.url },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "SK" },
            },
          },
        }
      : {}),
  };

  const mailSubject = encodeURIComponent(`Objednávka: ${m.nazov} (${m.sku})`);

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "E-shop", path: "/eshop" },
          { name: m.nazov, path: `/eshop/${m.sku}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
      />

      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="xl" className="pt-6 md:pt-10 pb-14 md:pb-20">
          <Link
            href="/eshop"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowRight className="w-3 h-3 rotate-180" aria-hidden />
            Späť na katalóg
          </Link>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Vizuál — vedro na fotke našej reálnej podlahy */}
            <div className="space-y-4">
              <div className="relative">
                <ProductVisual material={m} variant="detail" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/45 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide">
                  {m.vyrobca}
                </span>
                {!m.foto && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-sm text-white/85 text-[10px] font-semibold">
                    Ilustračný obrázok
                  </span>
                )}
              </div>

              {refFoto && m.kategoria === "Hlavná vrstva" ? (
                <RalNahlad fotoSrc={refFoto.src} fotoLabel={refFoto.label} textura={texturaProVizualizer(m)} />
              ) : refFoto ? (
                <figure className="relative aspect-[16/9] rounded-3xl overflow-hidden">
                  <Image
                    src={refFoto.src}
                    alt={refFoto.label}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={85}
                    className="object-cover"
                  />
                  <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-4 pt-8 pb-3 text-white text-sm font-semibold">
                    {refFoto.label}
                  </figcaption>
                </figure>
              ) : null}
            </div>

            {/* Info */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#12729f]">
                {m.kategoria} · {m.vyrobca} · SKU {m.sku}
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                {m.nazov}
              </h1>
              {m.balenie && (
                <div className="mt-1.5 text-zinc-500 font-medium">
                  Balenie: {m.balenie}
                </div>
              )}

              {/* Cena + vystačí na X m² — najdôležitejšie údaje veľké vedľa seba */}
              <div className="mt-6 flex flex-wrap items-stretch gap-3">
                <div className="rounded-2xl bg-zinc-900 text-white px-6 py-4">
                  <div className="text-xs uppercase tracking-wide text-white/60 font-semibold">
                    Konečná cena
                  </div>
                  <div className="mt-0.5 text-3xl md:text-4xl font-extrabold">
                    {m.cena_eur_s_dph > 0 ? `${fmt(m.cena_eur_s_dph)} €` : "Cena na dopyt"}
                  </div>
                </div>
                {m.pokryje_m2_z_balenia != null && (
                  <div className="rounded-2xl bg-[#3db6e8] text-[#0e1a3b] px-6 py-4">
                    <div className="text-xs uppercase tracking-wide text-[#0e1a3b]/70 font-semibold">
                      Vystačí na
                    </div>
                    <div className="mt-0.5 text-3xl md:text-4xl font-extrabold">
                      {String(m.pokryje_m2_z_balenia).replace(".", ",")} m²
                    </div>
                  </div>
                )}
              </div>
              {m.spotreba_kg_m2 != null && (
                <p className="mt-2 text-sm text-zinc-500">
                  Spotreba ~{String(m.spotreba_kg_m2).replace(".", ",")} kg/m²
                  {m.spotreba_poznamka ? ` — ${m.spotreba_poznamka}` : ""}
                </p>
              )}

              {/* Objednávka — košík (s ponukou skladby) + telefón/email */}
              <div className="mt-6 flex flex-wrap gap-3">
                {m.cena_eur_s_dph > 0 && (
                  <PridatDoKosika produkt={doKosika} skladba={skladba} />
                )}
                <a
                  href={`tel:${SITE.contact.phoneRaw}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-zinc-300 text-zinc-800 font-bold hover:border-zinc-500 hover:bg-white transition-colors"
                >
                  <Phone className="w-4 h-4" aria-hidden />
                  Objednať: {SITE.contact.phone}
                </a>
                <a
                  href={`mailto:${SITE.contact.email}?subject=${mailSubject}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-zinc-300 text-zinc-800 font-bold hover:border-zinc-500 hover:bg-white transition-colors"
                >
                  <Mail className="w-4 h-4" aria-hidden />
                  Objednať emailom
                </a>
              </div>

              {/* AI Vizualizácia — na každom hlavnom nátere, prednastavená na
                  túto textúru (user 2026-08-27). Odfotíš priestor a uvidíš,
                  ako bude vyzerať presne tento materiál. */}
              {texturaProVizualizer(m) && (
                <Link
                  href={`/ai-vizualizer?texture=${texturaProVizualizer(m)}${refFoto ? `&foto=${encodeURIComponent(refFoto.src)}` : ""}`}
                  className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#3db6e8] to-[#a855f7] px-5 py-4 text-white shadow-[0_8px_24px_rgba(168,85,247,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(168,85,247,0.55)]"
                >
                  <Sparkles className="w-5 h-5 shrink-0" aria-hidden />
                  <span className="text-center leading-tight">
                    <span className="block font-extrabold text-[15px] md:text-base">
                      Pozri si {m.nazov} u seba doma
                    </span>
                    <span className="block text-[12px] font-semibold text-white/85">
                      Odfoť priestor — AI ti hneď ukáže, ako to bude vyzerať. Zadarmo.
                    </span>
                  </span>
                </Link>
              )}

              {/* Trust prúžok (user 2026-08-27) */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-600">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" aria-hidden /> Bezpečná platba
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 shrink-0 text-[#3db6e8]" aria-hidden /> {DOPRAVA_ZADARMO.kratko}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#ea580c]" aria-hidden /> 14 dní na vrátenie
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden /> Overený predajca
                </span>
              </div>

              {/* Kalkulačka — hlavné vrstvy majú výber hrúbky (náter/1mm/2mm),
                  penetrácie a ostatné jednoduchý prepočet balení */}
              {m.cena_eur_s_dph > 0 && m.kategoria === "Hlavná vrstva" && m.balenie_kg != null ? (
                <div className="mt-6">
                  <HrubkaKalkulacka
                    balenieKg={m.balenie_kg}
                    cenaEur={m.cena_eur_s_dph}
                    jePu2mm={jePu}
                    cenaJeFinalna={!!m.cena_pevna}
                  />
                </div>
              ) : m.cena_eur_s_dph > 0 && m.spotreba_kg_m2 != null && m.balenie_kg != null ? (
                <div className="mt-6">
                  <BaleniaKalkulacka
                    spotrebaKgM2={m.spotreba_kg_m2}
                    balenieKg={m.balenie_kg}
                    cenaEur={m.cena_eur_s_dph}
                    jePu2mm={jePu}
                  />
                </div>
              ) : null}

              {m.cena_eur_s_dph > 0 && (
                <PorovnanieCien sku={m.sku} nasaCena={m.cena_eur_s_dph} />
              )}

              <KombinujSystem m={m} />

              {/* Technické parametre — zostavené z polí importu (spotreba,
                  časy, podklad). Jediný súvislý text na stránke pre Google;
                  nič sa tu nevymýšľa, čo v dátach nie je, sa nezobrazí. */}
              {(m.spotreba_kg_m2 != null ||
                m.spracovatelnost_min != null ||
                m.dalsia_vrstva_od_h != null ||
                m.pochodzne_h != null ||
                m.plne_vytvrdnute_dni != null ||
                m.vyzaduje_podklad_mpa != null ||
                (m.typy_podlah?.length ?? 0) > 0) && (
                <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
                  <h2 className="text-lg font-extrabold text-zinc-900">Technické parametre</h2>
                  <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {m.spotreba_kg_m2 != null && (
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5">
                        <dt className="text-zinc-500">Spotreba</dt>
                        <dd className="font-semibold text-zinc-900 text-right">
                          ~{String(m.spotreba_kg_m2).replace(".", ",")} kg/m²
                          {m.spotreba_poznamka ? ` (${m.spotreba_poznamka})` : ""}
                        </dd>
                      </div>
                    )}
                    {m.pokryje_m2_z_balenia != null && (
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5">
                        <dt className="text-zinc-500">Výdatnosť balenia</dt>
                        <dd className="font-semibold text-zinc-900 text-right">
                          {String(m.pokryje_m2_z_balenia).replace(".", ",")} m²
                        </dd>
                      </div>
                    )}
                    {m.spracovatelnost_min != null && (
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5">
                        <dt className="text-zinc-500">Spracovateľnosť</dt>
                        <dd className="font-semibold text-zinc-900 text-right">{m.spracovatelnost_min} min</dd>
                      </div>
                    )}
                    {(m.dalsia_vrstva_od_h != null || m.dalsia_vrstva_do_h != null) && (
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5">
                        <dt className="text-zinc-500">Ďalšia vrstva</dt>
                        <dd className="font-semibold text-zinc-900 text-right">
                          {m.dalsia_vrstva_od_h != null && m.dalsia_vrstva_do_h != null
                            ? `po ${m.dalsia_vrstva_od_h}–${m.dalsia_vrstva_do_h} h`
                            : m.dalsia_vrstva_od_h != null
                              ? `po ${m.dalsia_vrstva_od_h} h`
                              : `do ${m.dalsia_vrstva_do_h} h`}
                        </dd>
                      </div>
                    )}
                    {m.pochodzne_h != null && (
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5">
                        <dt className="text-zinc-500">Pochôdzne</dt>
                        <dd className="font-semibold text-zinc-900 text-right">po {m.pochodzne_h} h</dd>
                      </div>
                    )}
                    {m.plne_vytvrdnute_dni != null && (
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5">
                        <dt className="text-zinc-500">Plné vytvrdnutie</dt>
                        <dd className="font-semibold text-zinc-900 text-right">{m.plne_vytvrdnute_dni} dní</dd>
                      </div>
                    )}
                    {m.vyzaduje_podklad_mpa != null && (
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5">
                        <dt className="text-zinc-500">Pevnosť podkladu</dt>
                        <dd className="font-semibold text-zinc-900 text-right">min. {m.vyzaduje_podklad_mpa} MPa</dd>
                      </div>
                    )}
                    {(m.typy_podlah?.length ?? 0) > 0 && (
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5 sm:col-span-2">
                        <dt className="text-zinc-500">Vhodné pre</dt>
                        <dd className="font-semibold text-zinc-900 text-right">{m.typy_podlah!.join(", ")}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              {/* Postup aplikácie — napojené na oficiálny technický list výrobcu
                  (obsahuje pomery miešania, spotrebu a postup). User 2026-08-27:
                  namiesto vypnutého placeholdera funkčný odkaz na TL. */}
              {m.technicky_list && (
                <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <h2 className="text-lg font-extrabold text-zinc-900">
                    📋 Postup aplikácie a technický list
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 max-w-xl">
                    Presné pomery miešania, spotrebu, časy a krok-za-krokom postup
                    pre {m.nazov} nájdeš v oficiálnom technickom liste výrobcu.
                  </p>
                  <a
                    href={m.technicky_list}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white font-bold hover:bg-zinc-700 transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" aria-hidden />
                    Otvoriť technický list (PDF)
                  </a>
                </section>
              )}

              {/* Technické údaje — len vyplnené riadky */}
              {techRows.length > 0 && (
                <details className="mt-6 rounded-2xl border border-zinc-200 bg-white overflow-hidden group">
                  <summary className="cursor-pointer px-5 py-4 font-bold text-zinc-900 hover:bg-zinc-50 list-none flex items-center justify-between">
                    Technické údaje
                    <span className="text-[#12729f] group-open:rotate-45 transition-transform text-xl leading-none" aria-hidden>
                      +
                    </span>
                  </summary>
                  <dl className="px-5 pb-5 pt-1 border-t border-zinc-100">
                    {techRows.map((r) => (
                      <div
                        key={r.label}
                        className="flex items-baseline justify-between gap-4 py-2 border-b border-zinc-50 last:border-0"
                      >
                        <dt className="text-sm text-zinc-500">{r.label}</dt>
                        <dd className="text-sm font-bold text-zinc-900 text-right">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}

              {m.technicky_list && (
                <a
                  href={m.technicky_list}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#12729f] hover:text-[#1a8cc4] hover:underline"
                >
                  <FileText className="w-4 h-4" aria-hidden />
                  Technický list výrobcu (PDF)
                </a>
              )}
            </div>
          </div>

          {/* TopStone EP11 Metallic — oficiálny vzorník výrobcu */}
          {METALLIC_VZORY_SKUS.includes(m.sku) && (
            <div className="mt-12">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
                Vyberte si z jedinečných vzorov
              </h2>
              <p className="mt-2 text-sm md:text-base text-zinc-600 max-w-3xl">
                Oficiálne vzory výrobcu TopStone — takto vyzerá vyliata
                metalická stierka. Každá realizácia je originál, vzor sa nedá
                zopakovať 1:1.
              </p>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {TOPSTONE_METALLIC_VZORY.map((v) => (
                  <figure key={v.slug} className="group">
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <Image
                        src={v.image}
                        alt={`TopStone EP11 Metallic — vzor ${v.nazov}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 16vw"
                        quality={75}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <figcaption className="mt-1.5 text-center text-xs md:text-sm font-bold text-zinc-800">
                      {v.nazov}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-zinc-400">
                Zdroj vzorov: metalickasterka.cz (TopStone)
              </p>
            </div>
          )}

          {/* Kremičitý piesok — povinný doplnok k hlavným vrstvám */}
          {piesky.length > 0 && (
            <div className="mt-12 rounded-3xl bg-amber-50 border border-amber-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">
                Nezabudni na kremičitý piesok
              </h2>
              <p className="mt-2 text-sm md:text-base text-zinc-700 leading-relaxed max-w-3xl">
                Spotreba živice v technickom liste je <strong>bez piesku</strong>.
                Na každý 1&nbsp;mm hrúbky stierky treba navyše{" "}
                <strong>~0,7–0,9 kg/m² kremičitého piesku</strong> — bez neho
                podlahu neurobíš.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {piesky.map((p) => (
                  <Link
                    key={p.sku}
                    href={`/eshop/${p.sku}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white border border-amber-200 px-4 py-3 hover:border-amber-400 hover:shadow transition-all"
                  >
                    <div>
                      <div className="text-sm font-bold text-zinc-900 leading-snug">
                        {p.nazov}
                      </div>
                      {p.balenie && (
                        <div className="text-xs text-zinc-500">{p.balenie}</div>
                      )}
                    </div>
                    <div className="shrink-0 text-sm font-extrabold text-zinc-900">
                      {fmt(p.cena_eur_s_dph)} €
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
