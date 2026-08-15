import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SITE, getAddressLine } from "@/lib/site";

export const metadata: Metadata = {
  title: "Odstúpenie od zmluvy",
  description: `Poučenie o práve spotrebiteľa odstúpiť od zmluvy do 14 dní a vzorový formulár — e-shop ${SITE.legalName}.`,
  alternates: { canonical: "/odstupenie-od-zmluvy" },
};

const lastUpdated = "2026-08-15";

const H2 = "text-2xl font-bold mt-10 mb-4";
const UL = "list-disc list-inside space-y-1 leading-relaxed mb-6";
const P = "leading-relaxed mb-4";

export default function OdstupeniePage() {
  return (
    <Section tone="default" size="md">
      <Container size="md">
        <article className="prose prose-zinc max-w-none">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] mb-3">
            Platné od: {lastUpdated}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Odstúpenie od zmluvy do 14 dní
          </h1>

          <p className={P}>
            Ako spotrebiteľ máš právo odstúpiť od kúpnej zmluvy uzavretej na diaľku
            do <strong>14 dní od prevzatia tovaru</strong> aj bez udania dôvodu
            (zákon č. 102/2014 Z. z.).
          </p>

          <h2 className={H2}>Ako na to</h2>
          <ul className={UL}>
            <li>
              Pošli oznámenie o odstúpení e-mailom na{" "}
              <strong>{SITE.contact.email}</strong> alebo poštou na{" "}
              {getAddressLine()} — môžeš použiť formulár nižšie.
            </li>
            <li>
              Tovar vráť do 14 dní od odstúpenia — nepoužitý, v pôvodnom
              neotvorenom obale, so všetkým príslušenstvom. Náklady na vrátenie
              znášaš ty.
            </li>
            <li>
              Peniaze vrátane najlacnejšej ponúkanej dopravy ti vrátime do 14 dní
              od doručenia oznámenia rovnakým spôsobom, akým si platil (alebo na
              účet, ak si platil dobierkou). Môžeme počkať, kým tovar dostaneme
              späť.
            </li>
            <li>
              Zodpovedáš za zníženie hodnoty tovaru nad rámec bežného vyskúšania.
            </li>
          </ul>

          <h2 className={H2}>Kedy odstúpiť nemožno</h2>
          <ul className={UL}>
            <li>
              Tovar zhotovený podľa tvojich osobitných požiadaviek — najmä materiál
              <strong> miešaný na zákazku vo zvolenom odtieni RAL</strong>.
            </li>
            <li>
              Tovar v ochrannom obale, ktorý bol po dodaní otvorený — dvojzložkové
              chemické materiály nemožno po otvorení vrátiť do predaja.
            </li>
          </ul>

          <h2 className={H2}>Vzorový formulár na odstúpenie</h2>
          <div className="bg-[var(--color-bg-soft)] rounded-xl p-5 mb-6 text-sm leading-relaxed whitespace-pre-line">
            {`Adresát: ${SITE.legalName}, ${getAddressLine()}, ${SITE.contact.email}

Týmto oznamujem, že odstupujem od kúpnej zmluvy na tento tovar:
— číslo objednávky:
— názov tovaru:
— dátum objednania / dátum prevzatia:
— meno a priezvisko spotrebiteľa:
— adresa spotrebiteľa:
— číslo účtu (IBAN) na vrátenie platby:

Dátum a podpis (ak sa formulár podáva v listinnej podobe)`}
          </div>
          <p className={P}>
            Formulár skopíruj do e-mailu, doplň údaje a pošli na{" "}
            {SITE.contact.email}. Prijatie odstúpenia ti obratom potvrdíme.
          </p>
        </article>
      </Container>
    </Section>
  );
}
