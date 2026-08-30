import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SITE, getAddressLine, getLegalLine } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ochrana osobných údajov",
  description: `Zásady spracovania osobných údajov ${SITE.legalName} v súlade s GDPR.`,
  alternates: { canonical: "/ochrana-sukromia" },
};

const lastUpdated = "2026-08-30";

export default function OchranaSukromiaPage() {
  return (
    <Section tone="default" size="md">
      <Container size="md">
        <article className="prose prose-zinc max-w-none">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] mb-3">
            Posledná aktualizácia: {lastUpdated}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Zásady ochrany osobných údajov
          </h1>

          <p className="text-base text-[var(--color-fg-muted)] leading-relaxed mb-8">
            Tieto zásady popisujú, ako {SITE.legalName} (ďalej „prevádzkovateľ")
            spracováva tvoje osobné údaje pri používaní webu {SITE.domain} a
            kontaktovaní cez formulár, telefón alebo email.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">1. Prevádzkovateľ</h2>
          <div className="bg-[var(--color-bg-soft)] rounded-xl p-5 mb-6 text-sm leading-relaxed">
            <strong>{SITE.legalName}</strong>
            <br />
            {getAddressLine()}
            <br />
            IČO: {SITE.business.ico} • DIČ: {SITE.business.dic}
            {SITE.business.isVatPayer && (
              <>
                <br />
                IČ DPH: {SITE.business.icDph}
              </>
            )}
            <br />
            {SITE.business.court}, oddiel: {SITE.business.section}, vložka č.{" "}
            {SITE.business.insertNo}
            <br />
            E-mail: {SITE.contact.email} • Tel: {SITE.contact.phone}
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">2. Aké údaje zbierame</h2>
          <p className="leading-relaxed mb-3">
            Pri vyplnení kontaktného formulára spracúvame:
          </p>
          <ul className="list-disc list-inside space-y-1 leading-relaxed mb-6">
            <li><strong>Identifikačné údaje:</strong> meno, priezvisko</li>
            <li><strong>Kontaktné údaje:</strong> e-mailová adresa, telefónne číslo</li>
            <li><strong>Obsah dopytu:</strong> popis priestoru, plocha, fotky (ak ich pošleš)</li>
            <li><strong>Technické údaje:</strong> IP adresa, user agent, referer (anti-spam)</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">3. Účel spracovania</h2>
          <ul className="list-disc list-inside space-y-1 leading-relaxed mb-6">
            <li>Spracovanie tvojho dopytu a vypracovanie cenovej ponuky</li>
            <li>Kontaktovanie pre upresnenie detailov</li>
            <li>Plnenie zmluvných povinností pri realizácii podlahy</li>
            <li>Vedenie účtovnej a daňovej evidencie</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">4. Právny základ</h2>
          <p className="leading-relaxed mb-6">
            Spracovanie prebieha na základe <strong>tvojho súhlasu</strong>{" "}
            (Čl. 6 ods. 1 písm. a GDPR) udeleného odoslaním formulára, alebo
            <strong> opatrenia pred uzavretím zmluvy</strong> (Čl. 6 ods. 1 písm. b).
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">5. Doba uchovávania</h2>
          <ul className="list-disc list-inside space-y-1 leading-relaxed mb-6">
            <li>Dopyty bez objednávky: <strong>1 rok</strong> od posledného kontaktu</li>
            <li>Realizované objednávky: <strong>10 rokov</strong> (zákon o účtovníctve)</li>
            <li>Daňové doklady: <strong>10 rokov</strong></li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">5a. Nákup v e-shope</h2>
          <p className="leading-relaxed mb-3">
            Pri objednávke v e-shope navyše spracúvame fakturačné údaje
            (meno, priezvisko, adresa, pri firmách IČO/DIČ), doručovaciu adresu
            a údaje o objednanom tovare — právnym základom je{" "}
            <strong>plnenie zmluvy</strong> (čl. 6 ods. 1 písm. b GDPR) a{" "}
            <strong>zákonná povinnosť</strong> vedenia účtovníctva (čl. 6 ods. 1
            písm. c). Účtovné doklady uchovávame 10 rokov. Pri žiadosti o B2B účet
            spracúvame názov firmy, IČO a kontaktné údaje počas trvania spolupráce.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">6. Príjemcovia údajov</h2>
          <p className="leading-relaxed mb-3">
            Údaje neposkytujeme tretím stranám okrem nasledujúcich spracovateľov:
          </p>
          <ul className="list-disc list-inside space-y-2 leading-relaxed mb-6">
            <li>
              <strong>Cloudflare, Inc.</strong> — hosting webu a ochrana formulárov
              proti botom (Turnstile). Vidí technické údaje každej návštevy —
              IP adresu, prehliadač a to, ktorú stránku si otvoril. Bez toho by
              web nebežal a formuláre by zaplavil spam. (USA, štandardné
              zmluvné doložky EÚ)
            </li>
            <li>
              <strong>Neon Inc.</strong> — databáza v EÚ (Frankfurt), kde nám
              fyzicky ležia dopyty, objednávky z e-shopu a fotky nahraté do AI
              vizualizéra. Je to len úložisko — Neon s údajmi sám nič nerobí.
            </li>
            <li>
              <strong>Resend Inc.</strong> — odosielanie e-mailov (potvrdenie
              dopytu, objednávky, prihlasovacie linky do administrácie). Dostane
              tvoje meno, e-mailovú adresu a obsah správy, ktorú ti posielame.
              (USA, štandardné zmluvné doložky EÚ)
            </li>
            <li>
              <strong>NajCRM</strong> (app.najcrm.sk) — systém, v ktorom dopyty
              vybavujeme. Ide doň celý obsah odoslaného formulára: meno, e-mail,
              telefón, plocha, typ podlahy, priestor, termín, tvoja správa a
              údaje o tom, odkiaľ si na web prišiel (referer, UTM parametre,
              prehliadač). Bez toho by sa k tebe s ponukou nikto neozval.
            </li>
            <li>
              <strong>Google LLC — Gemini</strong> — AI model, ktorý v AI
              vizualizéri prekreslí podlahu na tvojej fotke. Dostane fotku,
              ktorú nahráš, a text s vybranou farbou a povrchom. Fotku aj
              výsledok si ukladáme aj my, aby sme vedeli skontrolovať kvalitu
              generovania. (USA, štandardné zmluvné doložky EÚ)
            </li>
            <li>
              <strong>Google LLC — Tag Manager, Analytics a Ads</strong> —
              meranie návštevnosti a účinnosti reklamy. Načíta sa iba s tvojím
              súhlasom v cookies. (USA, štandardné zmluvné doložky EÚ)
            </li>
            <li>
              <strong>Meta Platforms</strong> — marketingový pixel pre reklamy
              na Facebooku a Instagrame. Načíta sa iba s tvojím súhlasom v
              cookies. (USA, štandardné zmluvné doložky EÚ)
            </li>
            <li>
              <strong>Cookiebot</strong> — cookie lišta. Uloží si záznam o tom,
              s čím si súhlasil (spolu s anonymizovanou IP), aby sme tvoju voľbu
              vedeli preukázať a nepýtali sa ťa pri každej návšteve znova.
            </li>
            <li>
              <strong>Dopravca zásielky</strong> (kuriérska spoločnosť) — meno,
              adresa a telefón, aby ti mal kto doručiť objednávku
            </li>
            <li>
              <strong>Stripe Payments Europe, Ltd.</strong> — spracovanie platby
              kartou (ak zvolíš platbu kartou); údaje o karte vidí len Stripe,
              k nám sa nedostanú
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">7. Tvoje práva</h2>
          <p className="leading-relaxed mb-3">Podľa GDPR máš právo:</p>
          <ul className="list-disc list-inside space-y-1 leading-relaxed mb-6">
            <li>Žiadať <strong>prístup</strong> k údajom</li>
            <li>Žiadať <strong>opravu</strong> nesprávnych údajov</li>
            <li>Žiadať <strong>výmaz</strong> ("právo byť zabudnutý")</li>
            <li>Žiadať <strong>obmedzenie</strong> spracovania</li>
            <li>Žiadať <strong>prenosnosť</strong> údajov</li>
            <li><strong>Namietať</strong> proti spracovaniu</li>
            <li><strong>Odvolať súhlas</strong> kedykoľvek</li>
            <li>Podať <strong>sťažnosť</strong> na Úrad pre ochranu osobných údajov SR</li>
          </ul>
          <p className="leading-relaxed mb-6">
            Práva uplatníš e-mailom na <a href={`mailto:${SITE.contact.email}`} className="text-[#3db6e8] underline">{SITE.contact.email}</a> — odpovieme najneskôr do 30 dní.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">8. Cookies</h2>
          <p className="leading-relaxed mb-6">
            Web používa cookies pre fungovanie, analytiku a marketing. Detail v{" "}
            <a href="/cookies" className="text-[#3db6e8] underline">
              zásadách cookies
            </a>
            . Voľbu môžeš kedykoľvek zmeniť cez link „Cookies" v pätke.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">9. Záverečné ustanovenia</h2>
          <p className="leading-relaxed mb-6">
            Tieto zásady platia od dátumu uvedeného hore. Akékoľvek zmeny
            zverejníme na tejto stránke.
          </p>

          <p className="text-xs text-[var(--color-fg-subtle)] mt-12 leading-relaxed">
            {getLegalLine()}
          </p>
        </article>
      </Container>
    </Section>
  );
}
