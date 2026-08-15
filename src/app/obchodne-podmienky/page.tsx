import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SITE, getAddressLine } from "@/lib/site";

export const metadata: Metadata = {
  title: "Obchodné podmienky",
  description: `Všeobecné obchodné podmienky e-shopu ${SITE.legalName} — objednávky, platba, doprava, odstúpenie od zmluvy a reklamácie.`,
  alternates: { canonical: "/obchodne-podmienky" },
};

const lastUpdated = "2026-08-15";

const H2 = "text-2xl font-bold mt-10 mb-4";
const UL = "list-disc list-inside space-y-1 leading-relaxed mb-6";
const P = "leading-relaxed mb-4";

export default function ObchodnePodmienkyPage() {
  return (
    <Section tone="default" size="md">
      <Container size="md">
        <article className="prose prose-zinc max-w-none">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] mb-3">
            Platné od: {lastUpdated}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Všeobecné obchodné podmienky
          </h1>

          <h2 className={H2}>I. Predávajúci</h2>
          <div className="bg-[var(--color-bg-soft)] rounded-xl p-5 mb-6 text-sm leading-relaxed">
            <strong>{SITE.legalName}</strong>
            <br />
            {getAddressLine()}
            <br />
            IČO: {SITE.business.ico} • DIČ: {SITE.business.dic}
            <br />
            {SITE.business.court}, oddiel: {SITE.business.section}, vložka č. {SITE.business.insertNo}
            <br />
            E-mail: {SITE.contact.email} • Tel: {SITE.contact.phone}
            <br />
            <strong>Predávajúci nie je platiteľom DPH — všetky ceny sú konečné.</strong>
          </div>
          <p className={P}>
            Tieto všeobecné obchodné podmienky (ďalej „VOP") upravujú vzťahy medzi
            predávajúcim a kupujúcim pri predaji tovaru na diaľku cez e-shop na
            doméne {SITE.domain}. Odoslaním objednávky kupujúci potvrdzuje, že sa
            s VOP oboznámil a súhlasí s nimi. Orgánom dozoru je Slovenská obchodná
            inšpekcia (SOI), Inšpektorát SOI pre Žilinský kraj.
          </p>

          <h2 className={H2}>II. Objednávka a uzavretie zmluvy</h2>
          <ul className={UL}>
            <li>Objednávka vzniká odoslaním košíka cez objednávkový formulár.</li>
            <li>
              Kúpna zmluva je uzavretá potvrdením objednávky predávajúcim e-mailom.
              Do potvrdenia môže kupujúci objednávku bezplatne zrušiť.
            </li>
            <li>
              Kupujúci zodpovedá za správnosť údajov v objednávke (kontakt, adresa,
              zvolené odtiene RAL).
            </li>
            <li>
              Vlastníctvo tovaru a nebezpečenstvo škody prechádza na kupujúceho
              prevzatím tovaru.
            </li>
          </ul>

          <h2 className={H2}>III. Ceny a platba</h2>
          <ul className={UL}>
            <li>
              Ceny sú uvedené v eurách a sú <strong>konečné</strong> — predávajúci
              nie je platiteľom DPH. Cena nezahŕňa dopravu.
            </li>
            <li>
              Spôsoby platby: bankový prevod, dobierka, online platba kartou (ak je
              dostupná). Pri prevode je splatnosť 7 dní od potvrdenia objednávky;
              po jej márnom uplynutí môže predávajúci od zmluvy odstúpiť.
            </li>
            <li>
              Pri tovare označenom „cena na dopyt" zašle predávajúci cenovú ponuku
              e-mailom; zmluva vzniká až jej odsúhlasením.
            </li>
          </ul>

          <h2 className={H2}>IV. Doprava a dodanie</h2>
          <ul className={UL}>
            <li>
              <strong>Osobný odber zdarma:</strong> Školská 480, 034 96 Komjatná —
              termín potvrdíme e-mailom alebo telefonicky.
            </li>
            <li>
              <strong>Kuriér / paletová preprava:</strong> cena dopravy závisí od
              hmotnosti zásielky — potvrdíme ju e-mailom pred odoslaním a kupujúci
              ju odsúhlasí. Bez odsúhlasenia dopravy tovar neodosielame a kupujúcemu
              nevzniká povinnosť platby za dopravu.
            </li>
            <li>
              Bežná lehota dodania je do 7 pracovných dní od pripísania platby;
              tovar miešaný na objednávku (odtiene RAL) do 14 pracovných dní.
              O predĺžení informujeme.
            </li>
            <li>
              Kupujúci je povinný pri prevzatí skontrolovať obal zásielky a zjavné
              poškodenie ihneď zapísať do preberacieho protokolu dopravcu a oznámiť
              na {SITE.contact.email}.
            </li>
          </ul>

          <h2 className={H2}>V. Odstúpenie od zmluvy (14 dní)</h2>
          <p className={P}>
            Kupujúci — spotrebiteľ má právo odstúpiť od zmluvy bez udania dôvodu do
            14 dní od prevzatia tovaru podľa zákona č. 102/2014 Z. z. Podrobný
            postup a vzorový formulár:{" "}
            <Link href="/odstupenie-od-zmluvy" className="text-[var(--color-brand)] font-semibold">
              Odstúpenie od zmluvy
            </Link>
            .
          </p>
          <p className={P}>
            <strong>Odstúpiť nemožno</strong> (§ 7 ods. 6 zákona č. 102/2014 Z. z.)
            najmä pri tovare zhotovenom podľa osobitných požiadaviek kupujúceho
            (materiál miešaný na zákazku — napr. zvolený odtieň RAL) a pri tovare,
            ktorý bol po dodaní otvorený a vzhľadom na svoju povahu (dvojzložkové
            chemické materiály) nemôže byť vrátený.
          </p>

          <h2 className={H2}>VI. Reklamácie</h2>
          <p className={P}>
            Záručná doba je 24 mesiacov od prevzatia tovaru, pri materiáloch s
            expiráciou do dátumu spotreby uvedeného na obale. Postup vybavenia
            reklamácie upravuje{" "}
            <Link href="/reklamacny-poriadok" className="text-[var(--color-brand)] font-semibold">
              Reklamačný poriadok
            </Link>
            .
          </p>

          <h2 className={H2}>VII. Odstúpenie zo strany predávajúceho</h2>
          <p className={P}>
            Predávajúci môže od zmluvy odstúpiť, ak sa plnenie stane nemožným
            (tovar výrobca prestal dodávať), ak sa výrazne zmenili ceny vstupov,
            alebo pri zjavnej chybe v cene (napr. 1 € pri tovare s obvyklou cenou
            100 €). Prijaté platby bezodkladne vráti.
          </p>

          <h2 className={H2}>VIII. Osobné údaje</h2>
          <p className={P}>
            Spracovanie osobných údajov popisujú{" "}
            <Link href="/ochrana-sukromia" className="text-[var(--color-brand)] font-semibold">
              Zásady ochrany osobných údajov
            </Link>
            .
          </p>

          <h2 className={H2}>IX. Alternatívne riešenie sporov</h2>
          <p className={P}>
            Ak kupujúci — spotrebiteľ nie je spokojný s vybavením reklamácie alebo
            sa domnieva, že boli porušené jeho práva, môže sa obrátiť na
            predávajúceho so žiadosťou o nápravu. Ak predávajúci odpovie zamietavo
            alebo neodpovie do 30 dní, spotrebiteľ môže podať návrh na začatie
            alternatívneho riešenia sporu subjektu ARS podľa zákona č. 391/2015
            Z. z. — zoznam subjektov vedie Ministerstvo hospodárstva SR
            (economy.gov.sk). Spor možno riešiť aj cez európsku platformu RSO.
          </p>

          <h2 className={H2}>X. Záverečné ustanovenia</h2>
          <p className={P}>
            VOP platia v znení účinnom v deň odoslania objednávky. Vzťahy
            neupravené VOP sa riadia právom Slovenskej republiky, najmä zákonom
            č. 40/1964 Zb. (Občiansky zákonník), zákonom č. 102/2014 Z. z. a
            zákonom č. 250/2007 Z. z. o ochrane spotrebiteľa.
          </p>
        </article>
      </Container>
    </Section>
  );
}
