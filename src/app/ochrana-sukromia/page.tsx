import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SITE, getAddressLine, getLegalLine } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ochrana osobných údajov",
  description: `Zásady spracovania osobných údajov ${SITE.legalName} v súlade s GDPR.`,
  alternates: { canonical: "/ochrana-sukromia" },
};

const lastUpdated = "2026-05-09";

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

          <h2 className="text-2xl font-bold mt-10 mb-4">6. Príjemcovia údajov</h2>
          <p className="leading-relaxed mb-3">
            Údaje neposkytujeme tretím stranám okrem nasledujúcich spracovateľov:
          </p>
          <ul className="list-disc list-inside space-y-1 leading-relaxed mb-6">
            <li><strong>Vercel Inc.</strong> — hosting webu (USA, štandardné zmluvné doložky EÚ)</li>
            <li><strong>Resend Inc.</strong> — odosielanie transakčných emailov</li>
            <li><strong>Neon Inc.</strong> — databáza dopytov (EÚ región)</li>
            <li><strong>Google LLC</strong> — analytika (iba s tvojím súhlasom v cookies)</li>
            <li><strong>Meta Platforms</strong> — marketingový pixel (iba s tvojím súhlasom)</li>
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
