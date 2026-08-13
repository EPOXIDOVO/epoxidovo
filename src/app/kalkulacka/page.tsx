import type { Metadata } from "next";
import { KalkulackaClient } from "./KalkulackaClient";

export const metadata: Metadata = {
  title: "Zisti cenu svojej epoxidovej podlahy — online kalkulačka",
  description:
    "Vyplň 60-sekundový formulár a orientačná cenová ponuka na epoxidovú podlahu ti príde na email. Nezáväzné a zadarmo. Realizujeme po celom Slovensku.",
  alternates: { canonical: "/kalkulacka" },
};

/**
 * Ads landing page — automatická cenová ponuka.
 *
 * Flow: kategória (karty v štýle "Čo všetko vieme vyčarovať") → parametre
 * (plocha / priestor / lokalita / termín) → kontakt → submit.
 *
 * Submit ide cez existujúci POST /api/lead (Origin + rate-limit + Turnstile
 * + honeypot) so source: "kalkulacka". Lead sa forwarduje do NAJCRM
 * (BDSMANAGER webhook), kde generátor automaticky pripraví orientačnú CP
 * a pošle ju zákazníkovi na email — preto je stránka bez ceny na obrazovke:
 * cena príde mailom (vyššia kvalita leadov, reálne emailové adresy).
 */
export default function KalkulackaPage() {
  return <KalkulackaClient />;
}
