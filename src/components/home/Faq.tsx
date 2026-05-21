"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * FAQ sekcia — najčastejšie otázky o epoxidových podlahách.
 * Accordion (jeden otvorený naraz). Zlepšuje SEO (rich snippets).
 */

const FAQ_ITEMS = [
  {
    q: "Ako dlho schne epoxidová podlaha?",
    a: "Epoxidová podlaha je pochôdzna po 24 hodinách, plne zaťažiteľná po 7 dňoch. Presné časy závisia od teploty a vlhkosti priestoru.",
  },
  {
    q: "Aká je životnosť epoxidovej podlahy?",
    a: "Kvalitne realizovaná epoxidová podlaha vydrží 20+ rokov pri bežnom používaní. V priemyselných prevádzkach závisí od záťaže.",
  },
  {
    q: "Koľko stojí epoxidová podlaha?",
    a: "Ceny začínajú od 50 €/m² s DPH za chipsovú podlahu. Presná cena závisí od typu podlahy, plochy, stavu podkladu a doplnkov.",
  },
  {
    q: "Aký podklad potrebujem?",
    a: "Najlepší je betónový podklad s vlhkosťou max. 4 %. Pri starých podlahách robíme prípravu (brúsenie, sanácia trhlín).",
  },
  {
    q: "Robíte aj v zime?",
    a: "Áno, v interiéri pri teplote nad 15 °C. Garáže a haly s kúrením sa dajú robiť celoročne.",
  },
  {
    q: "Ako sa epoxidová podlaha čistí?",
    a: "Stačí bežné metenie a vlhká utierka. Žiadne fugy, žiadna údržba. Pri náročnejších priestoroch odporúčame neutrálne čistiace prostriedky.",
  },
  {
    q: "Aký je rozdiel medzi epoxidom a polyuretánom?",
    a: "Epoxid je tvrdší, odolnejší voči chemikáliám, lacnejší. Polyuretán je pružnejší, odolnejší voči UV a teplotným zmenám, používa sa pre športové podlahy a vonkajšie priestory.",
  },
  {
    q: "Koľko trvá realizácia?",
    a: "Garáž (do 50 m²) — 2 dni. Byt/prevádzka (100–200 m²) — 3–4 dni. Hala (500+ m²) — 5–10 dní podľa systému.",
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left hover:opacity-80 transition-opacity"
      >
        <span className="text-base md:text-lg font-semibold text-[var(--color-fg)] tracking-tight">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-[#3db6e8] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed pr-8">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="relative bg-[var(--color-bg-soft)]">
      <Container size="lg" className="py-20 md:py-28 lg:py-32">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow justify-center">ČASTÉ OTÁZKY</span>
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-[var(--color-fg)]">
            Odpovede na to, čo sa nás pýtajú
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] px-6 md:px-10">
          {FAQ_ITEMS.map((item) => (
            <Item key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </Container>

      {/* JSON-LD pre FAQ rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((i) => ({
              "@type": "Question",
              name: i.q,
              acceptedAnswer: { "@type": "Answer", text: i.a },
            })),
          }),
        }}
      />
    </section>
  );
}
