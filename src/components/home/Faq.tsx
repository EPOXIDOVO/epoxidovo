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
    q: "Ako dlho trvá realizácia epoxidovej podlahy?",
    a: "Bežná podlaha do 50 m² je hotová za 3–5 dní. Najprv pripravujeme podklad (1–2 dni), potom nanášame epoxid (1 deň) a finálnu vrstvu (1 deň). Pri väčších priestoroch sa časový plán dohodne pri obhliadke.",
  },
  {
    q: "Koľko stojí epoxidová podlaha?",
    a: "Cena závisí od typu podlahy a stavu podkladu. Orientačne: jednofarebná od 35 €/m², chipsová od 42 €/m², mramorová od 65 €/m², metalická od 75 €/m². Presnú ponuku ti pošleme po obhliadke priestoru.",
  },
  {
    q: "Je epoxidová podlaha vhodná do kuchyne aj kúpeľne?",
    a: "Áno. Epoxid je vodotesný, hygienicky čistý a neabsorbuje pachy ani škvrny. V kúpeľni odporúčame anti-slip variantu pre bezpečnosť. V kuchyni je ideálny — bez špár, ľahká údržba.",
  },
  {
    q: "Ako sa o podlahu starať?",
    a: "Stačí mokrý mop a štandardný čistič na podlahy. Bez voskovania, leštenia, špár ktoré treba čistiť. Pri väčšej záťaži (garáž, dielňa) odporúčame raz ročne aplikovať tenkú údržbovú vrstvu.",
  },
  {
    q: "Môžem ju mať aj v starom byte / dome?",
    a: "Áno, ak je podklad kvalitný (nie popraskaný, nevlhký). Pri obhliadke skontrolujeme podklad — väčšinou stačí povrchová úprava. V krajnom prípade brúsenie a vyrovnávacia vrstva.",
  },
  {
    q: "Aká je životnosť?",
    a: "Pri správnej realizácii a bežnej domácej záťaži 20+ rokov. V priemyselnom prostredí 10–15 rokov v závislosti od záťaže. Drobné poškodenia sa dajú lokálne opraviť.",
  },
  {
    q: "Robíte aj v iných regiónoch než Žilinský kraj?",
    a: "Áno, realizujeme po celom Slovensku. Sídlime v Ružomberku, ale väčšina projektov je mimo nášho mesta. Pri väčších realizáciách vieme prísť kdekoľvek.",
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
