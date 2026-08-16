import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { EshopClient } from "./EshopClient";
import { MATERIALY } from "@/lib/materialy";
import Image from "next/image";
import { Phone } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "E-shop — epoxidové materiály Sika, TopStone, Arturo a UZIN",
  description:
    "Profesionálne epoxidové materiály, ktoré používame na vlastných realizáciách — penetrácie, hlavné vrstvy, vrchné laky, nivelačné hmoty, pigmenty, chipsy a kremičité piesky. Sika, TopStone, Arturo a UZIN, konečné ceny.",
  alternates: { canonical: "/eshop" },
};

/**
 * E-shop — katalóg materiálov (Sika + TopStone z CRM, Arturo + UZIN z HA-UZ cenníkov).
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
            {MATERIALY.length} produktov Sika, TopStone, Arturo a UZIN — presne tie, ktoré
            používame na vlastných realizáciách. Konečné ceny, predaj v celých
            baleniach.
          </p>
        </Container>
      </section>

      <div className="bg-[#f7f7f4]">
        <EshopClient />
      </div>

      {/* Galéria dôvery — ten istý materiál lejeme aj my (presunuté z hubu) */}
      <section className="bg-[#0e1a3b] text-white noise-overlay">
        <Container size="xl" className="py-14 md:py-20">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ textWrap: "balance" }}>
            Ten istý materiál lejeme aj my
          </h2>
          <p className="mt-2 text-white/70 max-w-2xl">
            Nepredávame nič, čo sme sami nemali na valci. Pozri si realizácie
            z materiálov, ktoré tu kupuješ.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { src: "/images/categories/metalicke.jpg", alt: "Metalická epoxidová podlaha — realizácia EPOXIDOVO" },
              { src: "/images/realizacie/r-48.jpg", alt: "Chipsová podlaha v garáži — realizácia EPOXIDOVO" },
              { src: "/images/hero/byvanie-v2.webp", alt: "Jednofarebná liata podlaha v interiéri — realizácia EPOXIDOVO" },
              { src: "/images/realizacie/r-20.jpg", alt: "Modrá priemyselná podlaha v hale — realizácia EPOXIDOVO" },
            ].map((f) => (
              <div key={f.src} className="relative aspect-square rounded-2xl overflow-hidden">
                <Image src={f.src} alt={f.alt} fill sizes="(max-width: 768px) 50vw, 25vw" quality={85} className="object-cover" />
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-5 md:p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-amber-400" aria-hidden>★★★★★</div>
              <div className="mt-1 font-extrabold text-lg">
                Nevieš, ktorú skladbu zvoliť? Zavoláme ti a poradíme zadarmo.
              </div>
              <div className="mt-1 text-sm text-white/60">
                Po–Pi 8:00 – 17:00 · {SITE.contact.phone}
              </div>
            </div>
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#16a34a] text-white font-bold hover:bg-[#15803d] shadow-[0_10px_28px_rgba(22,163,74,0.4)] transition-colors whitespace-nowrap"
            >
              <Phone className="w-4 h-4" aria-hidden />
              Zavolať teraz
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
