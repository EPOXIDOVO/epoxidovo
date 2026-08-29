import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { ProductVisual } from "@/components/eshop/ProductVisual";
import { MATERIALY } from "@/lib/materialy";
import { OBSAH_KATEGORIE, SKUPINY, obsahKategoria } from "@/lib/obsah-kategorie";
import { VYROBCA_LOGO } from "@/lib/vyrobca-logo";
import { SITE } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld-safe";

/**
 * Statické SEO stránky kategórií — /eshop/kategoria/nivelacie atď.
 *
 * Katalóg na /eshop je client-side (filtre cez ?skupina=), takže Google
 * v serverovom HTML videl len prvých 16 produktov z 352 a žiadnu
 * kategóriu ako samostatnú stránku. Tu má každá skupina aj podkategória
 * vlastnú URL s celým zoznamom produktov vykresleným na serveri.
 *
 * Slug = id zo SKUPINY alebo OBSAH_KATEGORIE. Pri kolízii (penetracie,
 * hlavne, laky, kamenny-koberec, prisady, naradie sú v oboch) vyhráva
 * skupina — je širšia.
 */

type Kat = { slug: string; label: string; popis: string; test: (sku: string) => boolean };

function vsetkyKategorie(): Kat[] {
  const out: Kat[] = [];
  const videne = new Set<string>();
  for (const s of SKUPINY) {
    out.push({
      slug: s.id,
      label: s.label,
      popis: s.popis || OBSAH_KATEGORIE.find((k) => k.id === s.deti[0])?.popis || "",
      test: (sku) => {
        const m = MATERIALY.find((x) => x.sku === sku)!;
        return s.deti.includes(obsahKategoria(m));
      },
    });
    videne.add(s.id);
  }
  for (const k of OBSAH_KATEGORIE) {
    if (videne.has(k.id) || k.id === "ostatne") continue;
    out.push({
      slug: k.id,
      label: k.label,
      popis: k.popis,
      test: (sku) => obsahKategoria(MATERIALY.find((x) => x.sku === sku)!) === k.id,
    });
  }
  return out;
}

function najdi(slug: string): Kat | undefined {
  return vsetkyKategorie().find((k) => k.slug === slug);
}

export function generateStaticParams() {
  return vsetkyKategorie().map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const k = najdi(slug);
  if (!k) return {};
  const produkty = MATERIALY.filter((m) => k.test(m.sku) && m.cena_eur_s_dph > 0);
  const vyrobcovia = [...new Set(produkty.map((m) => m.vyrobca))].join(", ");
  const odCeny = produkty.length ? Math.min(...produkty.map((m) => m.cena_eur_s_dph)) : null;
  const titul = `${k.label} — ${produkty.length} produktov${odCeny != null ? ` od ${odCeny.toFixed(2).replace(".", ",")} €` : ""}`;
  const popis = `${k.label} na epoxidové a polyuretánové podlahy: ${vyrobcovia}. ${k.popis.slice(0, 110)}`;
  // Fallback OG obrázok — prvý produkt s fotkou, inak brandový og-home.
  const ogFoto = produkty.find((m) => m.foto)?.foto ?? "/og-home.jpg";
  return {
    title: titul,
    description: popis,
    alternates: { canonical: `/eshop/kategoria/${slug}` },
    openGraph: {
      type: "website",
      url: `/eshop/kategoria/${slug}`,
      title: titul,
      description: popis,
      images: [{ url: ogFoto, width: 1200, height: 630, alt: k.label }],
    },
  };
}

export default async function KategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const k = najdi(slug);
  if (!k) notFound();

  const produkty = MATERIALY.filter((m) => k.test(m.sku) && m.cena_eur_s_dph > 0).sort(
    (a, b) => a.cena_eur_s_dph - b.cena_eur_s_dph,
  );

  // ItemList — Google vie zobraziť karusel produktov z kategórie
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: k.label,
    numberOfItems: produkty.length,
    itemListElement: produkty.slice(0, 50).map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/eshop/${m.sku}`,
      name: m.nazov,
    })),
  };

  const ostatne = vsetkyKategorie().filter((x) => x.slug !== slug).slice(0, 10);

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "E-shop", path: "/eshop" },
          { name: k.label, path: `/eshop/kategoria/${slug}` },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      <div className="bg-[#f7f7f4] min-h-screen">
        <Container size="xl" className="pt-6 md:pt-10 pb-16">
          <nav aria-label="Breadcrumb" className="text-xs md:text-sm font-bold text-zinc-500 mb-3">
            <ol className="inline-flex items-center gap-1.5">
              <li><Link href="/eshop" className="hover:text-[#12729f] transition-colors">E-shop</Link></li>
              <li aria-hidden className="text-zinc-300">/</li>
              <li className="text-[#12729f]">{k.label}</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0e1a3b]">{k.label}</h1>
          <p className="mt-2 text-[#4a5478] max-w-3xl leading-relaxed">{k.popis}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {produkty.length} produktov · konečné ceny, nie sme platiteľmi DPH
          </p>

          {/* interaktívny katalóg s filtrami je na /eshop — tu rovnaká skupina predvolená */}
          <Link
            href={`/eshop?skupina=${slug}#katalog`}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0e1a3b] text-white font-bold text-sm hover:bg-[#1a2b57] transition-colors"
          >
            Otvoriť s filtrami v katalógu →
          </Link>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {produkty.map((m) => (
              <Link
                key={m.sku}
                href={`/eshop/${m.sku}`}
                className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:shadow-[0_14px_36px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative">
                  <ProductVisual material={m} variant="card" />
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 shadow text-[#0e1a3b] text-[10px] md:text-[11px] font-bold uppercase tracking-wide">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={VYROBCA_LOGO[m.vyrobca]} alt="" className="h-4 w-auto max-w-16 object-contain" />
                    {m.vyrobca}
                  </span>
                </div>
                <div className="p-3 md:p-4">
                  <h2 className="text-[13px] md:text-[15px] font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#12729f] transition-colors">
                    {m.nazov}
                  </h2>
                  {m.balenie && <div className="mt-0.5 text-[11px] md:text-xs text-zinc-500">{m.balenie}</div>}
                  <div className="mt-1.5 text-base md:text-lg font-extrabold text-zinc-900">
                    {m.cena_eur_s_dph.toFixed(2).replace(".", ",")} €
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ďalšie kategórie — interné prelinkovanie */}
          <nav aria-label="Ďalšie kategórie" className="mt-12">
            <h2 className="text-sm font-black uppercase tracking-wide text-zinc-500 mb-3">Ďalšie kategórie</h2>
            <div className="flex flex-wrap gap-2">
              {ostatne.map((o) => (
                <Link
                  key={o.slug}
                  href={`/eshop/kategoria/${o.slug}`}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-sm font-semibold text-zinc-700 hover:border-[#3db6e8] hover:text-[#12729f] transition-colors"
                >
                  {o.label}
                </Link>
              ))}
            </div>
          </nav>
        </Container>
      </div>
    </>
  );
}
