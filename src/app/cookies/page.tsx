import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CookieSettingsTrigger } from "@/components/cookies/CookieSettingsTrigger";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Zásady cookies",
  description: `Aké cookies používa ${SITE.domain} a ako ich môžeš spravovať.`,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <Section tone="default" size="md">
      <Container size="md">
        <article className="prose prose-zinc max-w-none">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Zásady cookies
          </h1>

          <p className="text-base text-[var(--color-fg-muted)] leading-relaxed mb-8">
            {SITE.domain} používa cookies pre základné fungovanie webu, analytiku
            návštevnosti a marketingové účely. Tieto zásady popisujú, aké
            cookies používame a ako ich môžeš spravovať.
          </p>

          <CookieSettingsTrigger />

          <h2 className="text-2xl font-bold mt-12 mb-4">Čo sú cookies?</h2>
          <p className="leading-relaxed mb-6">
            Cookies sú malé textové súbory, ktoré sa ukladajú do tvojho
            prehliadača pri návšteve webu. Pomáhajú stránke pamätať si tvoje
            voľby a lepšie fungovať.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Aké kategórie cookies používame</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">1. Nutné</h3>
          <p className="leading-relaxed mb-4">
            Bez nich web nefunguje. Sú vždy aktívne a nedajú sa odmietnuť.
            Zahŕňajú session cookies, CSRF tokeny a uloženie tvojej voľby cookies.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">2. Analytika</h3>
          <p className="leading-relaxed mb-4">
            Pomáhajú nám pochopiť ako sa web používa — koľko ľudí ho navštívi,
            ktoré stránky sú populárne, kde sú problémy. Údaje sú anonymné.
            Používame:
          </p>
          <ul className="list-disc list-inside space-y-1 leading-relaxed mb-4">
            <li>
              <strong>Google Analytics 4</strong> (Google LLC) — meranie
              návštevnosti
            </li>
            <li>
              <strong>Microsoft Clarity</strong> (Microsoft) — anonymné
              recordings pre UX zlepšenia
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3. Marketing</h3>
          <p className="leading-relaxed mb-4">
            Slúžia na personalizáciu reklám a retargeting. Bez tvojho súhlasu
            sa nenačítajú. Používame:
          </p>
          <ul className="list-disc list-inside space-y-1 leading-relaxed mb-4">
            <li>
              <strong>Meta Pixel</strong> (Meta Platforms) — Facebook/Instagram
              reklamy
            </li>
            <li>
              <strong>Google Ads</strong> — konverzné meranie a remarketing
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">Google Consent Mode v2</h2>
          <p className="leading-relaxed mb-6">
            Pred prijatím tvojej voľby sú všetky analytické a marketingové
            cookies <strong>blokované</strong>. Po výbere posielame stav súhlasu
            do Google a Meta — pracujú v anonymizovanom režime ak nesúhlasíš.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Ako spravovať cookies</h2>
          <ol className="list-decimal list-inside space-y-2 leading-relaxed mb-6">
            <li>
              Cez tlačidlo <strong>„Spravovať cookies"</strong> hore na tejto
              stránke
            </li>
            <li>
              V nastaveniach prehliadača (Chrome, Firefox, Safari…) — môžeš
              zmazať všetky cookies pre tento web
            </li>
            <li>
              Vymazaním lokálneho úložiska — banner sa pri ďalšej návšteve
              zobrazí znova
            </li>
          </ol>

          <h2 className="text-2xl font-bold mt-10 mb-4">Kontakt</h2>
          <p className="leading-relaxed mb-6">
            Otázky ohľadom cookies môžeš poslať na{" "}
            <a
              href={`mailto:${SITE.contact.email}`}
              className="text-[#3db6e8] underline"
            >
              {SITE.contact.email}
            </a>
            .
          </p>
        </article>
      </Container>
    </Section>
  );
}
