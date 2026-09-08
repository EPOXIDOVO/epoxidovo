import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { KurzFonts } from "@/components/kurz/landing/KurzShell";
import { SITE, getAddressLine } from "@/lib/site";
import { KURZ } from "@/content/kurz";
import "@/components/kurz/landing/landing.css";

export const metadata: Metadata = {
  title: "Obchodné podmienky online kurzu",
  description: `Obchodné podmienky online kurzu EPOXIDOVO Akadémia — objednávka, platba, sprístupnenie digitálneho obsahu, licencia, garancia vrátenia peňazí a reklamácie.`,
  alternates: { canonical: "/kurz/obchodne-podmienky" },
};

const lastUpdated = "8. september 2026";

/**
 * VOP pre online kurz — samostatné od e-shopových VOP, lebo predmetom nie je
 * tovar, ale digitálny obsah (video lekcie, PDF podklady, členská sekcia).
 * Stránka žije pod /kurz, takže renderuje bez globálneho chrome — nesie si
 * vlastný minimálny header/footer v štýle landingu.
 */
export default function KurzObchodnePodmienkyPage() {
  return (
    <KurzFonts>
      <div className="kl" lang="sk">
        <header style={{ borderBottom: "1px solid var(--kl-border)" }}>
          <div className="kl-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.5rem" }}>
            <Link href="/kurz" style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", fontWeight: 700, color: "var(--kl-ink)" }}>
              <Image src="/images/site/logo_v2.png" alt="EPOXIDOVO" width={40} height={38} />
              EPOXIDOVO Akadémia
            </Link>
            <Link href="/kurz#prihlaska" className="kl-btn kl-btn--primary" style={{ padding: "0.7rem 1.25rem", fontSize: "0.92rem" }}>
              Kúpiť kurz
            </Link>
          </div>
        </header>

        <main className="kl-section" style={{ paddingBlock: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          <div className="kl-container kl-legal" style={{ maxWidth: "48rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--kl-subtle)", marginBottom: "0.8rem" }}>
              Platné od: {lastUpdated}
            </p>
            <h1 style={{ fontSize: "clamp(1.9rem, 1.3rem + 2.4vw, 3rem)", marginBottom: "1.2rem" }}>
              Obchodné podmienky online kurzu
            </h1>
            <p>
              Tieto obchodné podmienky (ďalej „OP“) upravujú kúpu a používanie
              online kurzu EPOXIDOVO Akadémia, ponúkaného na stránke{" "}
              {SITE.domain}/kurz (ďalej „kurz“). Odoslaním objednávky kupujúci
              potvrdzuje, že sa s OP oboznámil a súhlasí s nimi. Na predaj tovaru
              v e-shope sa vzťahujú samostatné{" "}
              <Link href="/obchodne-podmienky">všeobecné obchodné podmienky</Link>.
            </p>

            <h2>I. Poskytovateľ</h2>
            <div className="kl-legal__card">
              <strong>{SITE.legalName}</strong>
              <br />
              {getAddressLine()}
              <br />
              IČO: {SITE.business.ico} · DIČ: {SITE.business.dic}
              <br />
              {SITE.business.court}, oddiel: {SITE.business.section}, vložka č. {SITE.business.insertNo}
              <br />
              E-mail: {SITE.contact.email} · Tel: {SITE.contact.phone}
              <br />
              <strong>Poskytovateľ nie je platiteľom DPH, všetky ceny sú konečné.</strong>
            </div>
            <p>
              Orgánom dozoru je Slovenská obchodná inšpekcia (SOI), Inšpektorát
              SOI pre Žilinský kraj, Predmestská 71, 011 79 Žilina.
            </p>

            <h2>II. Predmet kúpy</h2>
            <ul>
              <li>
                Kurz je digitálny obsah, ktorý sa nedodáva na hmotnom nosiči:
                video lekcie, pracovný manuál a podklady vo formáte PDF,
                kalkulačka spotreby, vzorová cenová ponuka a záverečný test,
                sprístupnené v členskej sekcii.
              </li>
              <li>
                Kurz sa predáva v balíkoch <strong>Štandard</strong> ({KURZ.priceStandard} €)
                a <strong>PRO s mentoringom</strong> ({KURZ.pricePro} €). Presný obsah
                balíkov je uvedený na stránke kurzu v čase objednávky.
              </li>
              <li>
                Lekcie sú v anglickom jazyku, textové podklady v angličtine a
                slovenčine. Kurz je vzdelávací materiál; nezakladá živnostenské
                ani iné oprávnenie na výkon činnosti.
              </li>
            </ul>

            <h2>III. Objednávka a uzavretie zmluvy</h2>
            <ul>
              <li>Objednávka vzniká odoslaním objednávkového formulára na stránke kurzu.</li>
              <li>
                Zmluva je uzavretá potvrdením objednávky poskytovateľom e-mailom,
                najneskôr sprístupnením kurzu.
              </li>
              <li>
                Kupujúci môže pri objednávke uviesť IČO; faktúra sa potom vystaví
                na firmu. Údaje v objednávke musia byť pravdivé a úplné.
              </li>
            </ul>

            <h2>IV. Cena a platba</h2>
            <ul>
              <li>
                Platí cena uvedená na stránke kurzu v okamihu odoslania
                objednávky. Poskytovateľ nie je platiteľom DPH, ceny sú konečné.
              </li>
              <li>
                Platba je možná online kartou (Stripe) alebo bankovým prevodom na
                základe faktúry. Pri prevode je splatnosť uvedená na faktúre;
                objednávka nezaplatená do 14 dní od splatnosti zaniká.
              </li>
              <li>Faktúru posielame e-mailom po prijatí platby.</li>
            </ul>

            <h2>V. Sprístupnenie kurzu</h2>
            <ul>
              <li>
                Pri platbe kartou sa prístup do členskej sekcie posiela e-mailom
                bezodkladne po zaplatení, najneskôr do 24 hodín. Pri prevode po
                pripísaní platby na účet poskytovateľa.
              </li>
              <li>
                Prístup je časovo neobmedzený („navždy“): trvá minimálne 5 rokov
                od kúpy a ďalej po celý čas prevádzky členskej sekcie. Ak by
                poskytovateľ prevádzku členskej sekcie ukončil skôr ako 5 rokov od
                kúpy, umožní kupujúcemu obsah kurzu stiahnuť alebo vráti pomernú
                časť ceny.
              </li>
              <li>Súčasťou prístupu sú aj budúce aktualizácie kurzu bez príplatku.</li>
              <li>
                Na prehrávanie je potrebné zariadenie s internetovým pripojením a
                bežným prehliadačom; osobitný softvér sa nevyžaduje.
              </li>
            </ul>

            <h2>VI. Odstúpenie od zmluvy a garancia vrátenia peňazí</h2>
            <ul>
              <li>
                Spotrebiteľ má pri zmluve uzavretej na diaľku právo odstúpiť od
                zmluvy do 14 dní. Pri digitálnom obsahu toto právo zaniká, ak sa
                obsah so súhlasom spotrebiteľa sprístupní pred uplynutím lehoty a
                spotrebiteľ potvrdil, že bol o strate práva poučený. Tento súhlas
                udeľuje kupujúci zaškrtnutím pri objednávke.
              </li>
              <li>
                Nad rámec zákona poskytovateľ dáva <strong>zmluvnú garanciu
                vrátenia peňazí 14 dní</strong> od sprístupnenia kurzu: kupujúci
                (spotrebiteľ aj firma) môže bez udania dôvodu požiadať o vrátenie
                celej ceny e-mailom na {SITE.contact.email}. Peniaze vraciame do
                14 dní rovnakým spôsobom, akým bola platba prijatá, a prístup ku
                kurzu sa ukončí.
              </li>
              <li>
                Garancia sa nevzťahuje na zneužitie (napr. opakovaný nákup a
                vrátenie, stiahnutie alebo šírenie obsahu pred žiadosťou o
                vrátenie).
              </li>
              <li>
                Pri balíku PRO sa už vyčerpané mentoringové konzultácie pri
                vrátení odpočítajú pomernou sumou z vrátenej ceny.
              </li>
            </ul>

            <h2>VII. Licencia a autorské práva</h2>
            <ul>
              <li>
                Celý obsah kurzu (videá, texty, PDF, kalkulačky) je autorským
                dielom poskytovateľa. Kúpou získava kupujúci nevýhradnú,
                neprenosnú licenciu na osobné použitie pre jednu osobu.
              </li>
              <li>
                Zakázané je zdieľanie prístupových údajov, sťahovanie a ďalšie
                šírenie videí, verejné premietanie, predaj alebo poskytovanie
                obsahu tretím osobám vrátane vlastných školení.
              </li>
              <li>
                Pri firemnom prístupe platí licencia pre dohodnutý počet osôb
                uvedený v objednávke.
              </li>
              <li>
                Pri porušení licencie môže poskytovateľ prístup ukončiť bez
                náhrady; nárok na náhradu škody tým nie je dotknutý.
              </li>
            </ul>

            <h2>VIII. Mentoring v balíku PRO</h2>
            <ul>
              <li>
                Mentoring trvá 3 mesiace od sprístupnenia kurzu a prebieha
                telefonicky, e-mailom alebo cez WhatsApp v pracovných dňoch.
              </li>
              <li>
                Zahŕňa konzultácie postupu, kontrolu realizácie z fotografií a
                pomoc s cenovými ponukami. Nezahŕňa fyzickú účasť lektora na
                realizácii ani prevzatie zodpovednosti za dielo kupujúceho.
              </li>
            </ul>

            <h2>IX. Zodpovednosť a bezpečnosť práce</h2>
            <ul>
              <li>
                Kurz má vzdelávací charakter. Výsledky závisia od podmienok na
                stavbe, použitých materiálov a práce kupujúceho; poskytovateľ
                nezodpovedá za výsledok realizácií kupujúceho ani za jeho
                podnikateľské výsledky.
              </li>
              <li>
                Uvádzané spotreby, ceny materiálov a kalkulácie sú orientačné;
                záväzné sú vždy technické listy výrobcov materiálov.
              </li>
              <li>
                Práca s dvojzložkovými živicami a strojmi vyžaduje ochranné
                pomôcky a dodržiavanie kariet bezpečnostných údajov. Kupujúci
                pracuje na vlastnú zodpovednosť.
              </li>
            </ul>

            <h2>X. Reklamácie</h2>
            <ul>
              <li>
                Poskytovateľ zodpovedá za to, že kurz zodpovedá popisu a že
                členská sekcia je funkčná. Výpadky prístupu, nefunkčné lekcie
                alebo chýbajúci obsah reklamuj e-mailom na {SITE.contact.email}.
              </li>
              <li>
                Reklamáciu vybavíme bezodkladne, najneskôr do 30 dní od
                uplatnenia. O vybavení pošleme e-mailové potvrdenie.
              </li>
              <li>
                Spotrebiteľ sa môže obrátiť aj na subjekt alternatívneho riešenia
                sporov podľa zákona č. 391/2015 Z. z.; zoznam vedie Ministerstvo
                hospodárstva SR, patrí doň aj SOI.
              </li>
            </ul>

            <h2>XI. Ochrana osobných údajov</h2>
            <p>
              Spracúvanie osobných údajov pri objednávke, prevádzke členskej
              sekcie a mentoringu popisuje dokument{" "}
              <Link href="/ochrana-sukromia">Ochrana súkromia</Link>.
            </p>

            <h2>XII. Záverečné ustanovenia</h2>
            <ul>
              <li>
                Právne vzťahy sa riadia právom Slovenskej republiky, najmä
                Občianskym zákonníkom, zákonom č. 108/2024 Z. z. o ochrane
                spotrebiteľa a autorským zákonom.
              </li>
              <li>
                Poskytovateľ môže OP zmeniť; pre objednávku platí znenie účinné v
                čase jej odoslania.
              </li>
              <li>Tieto OP sú účinné od {lastUpdated}.</li>
            </ul>

            <p style={{ marginTop: "2.5rem" }}>
              <Link href="/kurz" className="kl-btn kl-btn--line">Späť na kurz</Link>
            </p>
          </div>
        </main>

        <footer className="kl-footer">
          <div className="kl-container kl-footer__row">
            <div className="kl-footer__copy">
              <p>© 2026 {SITE.legalName}</p>
            </div>
            <ul className="kl-footer__links">
              <li><Link href="/kurz">Kurz</Link></li>
              <li><Link href="/ochrana-sukromia">Ochrana súkromia</Link></li>
              <li><Link href="/obchodne-podmienky">VOP e-shopu</Link></li>
            </ul>
          </div>
        </footer>
      </div>
    </KurzFonts>
  );
}
