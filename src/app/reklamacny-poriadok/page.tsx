import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SITE, getAddressLine } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reklamačný poriadok",
  description: `Reklamačný poriadok e-shopu ${SITE.legalName} — lehoty, postup a vybavenie reklamácií.`,
  alternates: { canonical: "/reklamacny-poriadok" },
};

const lastUpdated = "2026-08-15";

const H2 = "text-2xl font-bold mt-10 mb-4";
const UL = "list-disc list-inside space-y-1 leading-relaxed mb-6";
const P = "leading-relaxed mb-4";

export default function ReklamacnyPoriadokPage() {
  return (
    <Section tone="default" size="md">
      <Container size="md">
        <article className="prose prose-zinc max-w-none">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] mb-3">
            Platné od: {lastUpdated}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Reklamačný poriadok
          </h1>
          <p className={P}>
            Reklamácie tovaru zakúpeného v e-shope {SITE.domain} vybavuje{" "}
            {SITE.legalName}, {getAddressLine()}, e-mail {SITE.contact.email},
            tel. {SITE.contact.phone}.
          </p>

          <h2 className={H2}>1. Záručná doba</h2>
          <ul className={UL}>
            <li>24 mesiacov od prevzatia tovaru.</li>
            <li>
              Pri chemických materiáloch s dátumom spotreby na obale zodpovedá
              predávajúci za vlastnosti tovaru do tohto dátumu — skladovanie podľa
              technického listu je podmienkou.
            </li>
            <li>
              Vadu treba vytknúť bez zbytočného odkladu po jej zistení, najneskôr
              do uplynutia záručnej doby.
            </li>
          </ul>

          <h2 className={H2}>2. Ako reklamovať</h2>
          <ul className={UL}>
            <li>
              Napíš na <strong>{SITE.contact.email}</strong>: číslo objednávky,
              názov produktu, popis vady a fotografie (obal so šaržou + prejav
              vady).
            </li>
            <li>
              Tovar doruč na adresu {getAddressLine()} — po dohode vieme zabezpečiť
              zvoz kuriérom.
            </li>
            <li>
              Prijatie reklamácie potvrdíme e-mailom, spôsob vybavenia určíme do
              3 pracovných dní; v zložitých prípadoch (posúdenie výrobcom) najneskôr
              do 30 dní. Po tejto lehote má spotrebiteľ právo od zmluvy odstúpiť.
            </li>
          </ul>

          <h2 className={H2}>3. Spôsob vybavenia</h2>
          <ul className={UL}>
            <li>Odstrániteľná vada: bezplatná oprava alebo výmena.</li>
            <li>
              Neodstrániteľná vada brániaca užívaniu: výmena, primeraná zľava
              alebo vrátenie kúpnej ceny.
            </li>
            <li>O vybavení vystavíme písomný doklad.</li>
          </ul>

          <h2 className={H2}>4. Na čo sa záruka nevzťahuje</h2>
          <ul className={UL}>
            <li>
              Vady spôsobené aplikáciou v rozpore s technickým listom výrobcu —
              nesprávny miešací pomer zložiek, aplikácia mimo teplotného rozsahu,
              nevyhovujúci alebo nepripravený podklad, prekročená doba
              spracovateľnosti.
            </li>
            <li>Bežné opotrebenie, mechanické poškodenie po prevzatí.</li>
            <li>Nesprávne skladovanie (mráz, priame slnko, otvorený obal).</li>
            <li>
              Vady, na ktoré bola poskytnutá zľava, alebo o ktorých kupujúci pri
              kúpe vedel.
            </li>
          </ul>
          <p className={P}>
            Pred aplikáciou si vždy prečítaj technický list produktu — nájdeš ho
            pri každom produkte v e-shope. Ak si nie si istý skladbou alebo
            postupom, zavolaj nám na {SITE.contact.phone}; poradíme zadarmo.
          </p>

          <h2 className={H2}>5. Dozor a spory</h2>
          <p className={P}>
            Orgánom dozoru je Slovenská obchodná inšpekcia. Pri nespokojnosti
            s vybavením reklamácie možno využiť alternatívne riešenie sporov
            podľa čl. IX Všeobecných obchodných podmienok.
          </p>
        </article>
      </Container>
    </Section>
  );
}
