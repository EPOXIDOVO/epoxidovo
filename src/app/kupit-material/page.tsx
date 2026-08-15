import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Package, Phone, Wrench, Shield } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { SADY } from "@/data/sady";
import { getSystem } from "@/data/systems";
import { calcSystem } from "@/lib/calculator";
import { SITE } from "@/lib/site";
import { SadaCard } from "./SadaCard";
import { CartBadge } from "./CartBadge";
import type { CartItem } from "@/lib/cart";

export const metadata: Metadata = {
  title: "Kúpiť materiál — kalkulátor skladby a sady",
  description:
    "Vypočítaj si presne koľko materiálu potrebuješ na epoxidovú alebo liatu podlahu, alebo si kúp hotovú sadu. Predaj v celých baleniach, konečné ceny.",
  alternates: { canonical: "/kupit-material" },
};

/**
 * FÁZA 5 — hub sekcie Kúpiť materiál: navigácia PODĽA POUŽITIA
 * (nie podľa značky), kalkulátor CTA, sady, katalóg.
 */

const USE_CASES = [
  { label: "Garáž", emoji: "🚗", href: "/kupit-material/kalkulacka?miesto=garaz" },
  { label: "Byt a dom", emoji: "🏠", href: "/kupit-material/kalkulacka?miesto=byt" },
  { label: "Dielňa", emoji: "🔧", href: "/kupit-material/kalkulacka?miesto=dielna" },
  { label: "Terasa", emoji: "☀️", href: "/kupit-material/kalkulacka?miesto=terasa" },
  { label: "Schody", emoji: "🪜", href: "/kupit-material/kalkulacka?miesto=schody" },
];

export default function KupitMaterialPage() {
  // sady sa počítajú kalkulátorom pri renderi — žiadny drift cien
  const sadyData = SADY.map((sada) => {
    const system = getSystem(sada.systemId)!;
    const calc = calcSystem(system, {
      areaM2: sada.areaM2,
      reservePct: sada.reservePct,
      thicknessMm: sada.thicknessMm,
    });
    const items: CartItem[] = [
      ...calc.layers
        .filter((l) => l.packs != null)
        .map((l) => ({
          productId: l.product.id,
          qty: l.packs as number,
          systemLabel: sada.name,
          systemId: system.id,
        })),
      ...calc.tools.map((t) => ({
        productId: t.product.id,
        qty: t.qty,
        systemLabel: sada.name,
        systemId: system.id,
      })),
    ];
    return {
      sada,
      items,
      priceLabel: calc.priceIsFinal
        ? `${calc.priceSubtotal.toFixed(2).replace(".", ",")} €`
        : `od ${calc.priceSubtotal.toFixed(2).replace(".", ",")} €`,
    };
  });

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Kúpiť materiál", path: "/kupit-material" },
        ]}
      />
      <CartBadge />

      {/* Hero + use-case navigácia */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 0%, rgba(61,182,232,0.22), transparent 75%)",
          }}
        />
        <Container size="xl" className="pt-24 md:pt-32 pb-12 md:pb-16 relative text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Kúpiť materiál
            <br />
            <span className="text-[#3db6e8]">presne toľko, koľko treba</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Kalkulátor prepočíta skladbu vrstvu po vrstve a naplní košík celými
            baleniami. Dodávateľ nie je platiteľom DPH — ceny sú konečné.
          </p>

          {/* Use-case navigácia */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {USE_CASES.map((u) => (
              <Link
                key={u.label}
                href={u.href}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/25 font-semibold hover:bg-white/20 hover:border-white/50 transition-colors"
              >
                <span aria-hidden>{u.emoji}</span> {u.label}
              </Link>
            ))}
            <Link
              href="/eshop"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/25 font-semibold hover:bg-white/20 hover:border-white/50 transition-colors"
            >
              <Wrench className="w-4 h-4" aria-hidden /> Náradie
            </Link>
            <Link
              href="/eshop"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/25 font-semibold hover:bg-white/20 hover:border-white/50 transition-colors"
            >
              <Shield className="w-4 h-4" aria-hidden /> Ochranné pomôcky
            </Link>
          </div>

          <div className="mt-8">
            <Link
              href="/kupit-material/kalkulacka"
              className="inline-flex items-center gap-3 px-9 md:px-12 py-4 md:py-5 rounded-full bg-[#f97316] text-white font-extrabold text-lg md:text-xl shadow-[0_14px_40px_rgba(249,115,22,0.55)] hover:bg-[#ea580c] hover:-translate-y-1 transition-all"
            >
              <Calculator className="w-6 h-6" aria-hidden />
              Spustiť kalkulátor materiálu
            </Link>
          </div>
        </Container>
      </section>

      {/* Sady */}
      <section className="bg-[#f7f7f4]">
        <Container size="xl" className="py-12 md:py-16">
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7 text-[#3db6e8]" aria-hidden />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
              Hotové sady na typické plochy
            </h2>
          </div>
          <p className="mt-2 text-zinc-600 max-w-2xl">
            Rovnaké položky, aké by ti vypočítal kalkulátor — jedným klikom do
            košíka. Množstvá sú v celých baleniach vrátane 5 % rezervy.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {sadyData.map(({ sada, items, priceLabel }) => (
              <SadaCard key={sada.id} sada={sada} items={items} priceLabel={priceLabel} />
            ))}
          </div>

          {/* Katalóg + B2B + telefón */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/eshop"
              className="rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-lg transition-shadow"
            >
              <div className="font-extrabold text-zinc-900">Katalóg produktov</div>
              <p className="mt-1 text-sm text-zinc-600">
                352 materiálov Sika, TopStone, Arturo a UZIN s filtrami a vyhľadávaním.
              </p>
            </Link>
            <Link
              href="/kupit-material/b2b"
              className="rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-lg transition-shadow"
            >
              <div className="font-extrabold text-zinc-900">Pre realizačné firmy (B2B)</div>
              <p className="mt-1 text-sm text-zinc-600">
                Registrácia cez IČO — veľkoobchodné podmienky po schválení.
              </p>
            </Link>
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              className="rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-lg transition-shadow"
            >
              <div className="font-extrabold text-zinc-900 inline-flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#3db6e8]" aria-hidden />
                Nejde to podľa predstáv?
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                Zavolajte nám, dokončíme to za vás: {SITE.contact.phone}
              </p>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
