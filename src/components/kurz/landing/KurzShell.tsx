import type * as React from "react";
import localFont from "next/font/local";
import { Outfit, Spline_Sans_Mono } from "next/font/google";
import { KurzLanding } from "./KurzLanding";
import type { Locale } from "./copy";

/**
 * Server wrapper: načíta fonty landingu (Clash Display self-hosted z
 * Fontshare — ITF Free Font License; Outfit a Spline Sans Mono z Google)
 * a vystaví ich ako CSS premenné, ktoré landing.css číta. Fonty sú
 * scopnuté na tento wrapper, zvyšok webu (Manrope) sa ich nedotkne.
 *
 * Mono font je na peniaze a čísla — tabuľkové číslice pôsobia ako reálny
 * výkaz, nie marketingový sľub (redizajn 2026-08-30).
 */
const clash = localFont({
  src: [
    { path: "../../../app/kurz/fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../../../app/kurz/fonts/ClashDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--kl-clash",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--kl-outfit",
  display: "swap",
});

const mono = Spline_Sans_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--kl-splmono",
  display: "swap",
});

/** Obal s fontovými CSS premennými — pre landing aj ďakovaciu stránku. */
export function KurzFonts({ children }: { children: React.ReactNode }) {
  return <div className={`${clash.variable} ${outfit.variable} ${mono.variable}`}>{children}</div>;
}

export function KurzShell({ locale }: { locale: Locale }) {
  return (
    <KurzFonts>
      <KurzLanding locale={locale} />
    </KurzFonts>
  );
}
