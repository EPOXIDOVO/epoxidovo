import type * as React from "react";
import localFont from "next/font/local";
import { Outfit } from "next/font/google";
import { KurzLanding } from "./KurzLanding";
import type { Locale } from "./copy";

/**
 * Server wrapper: načíta fonty landingu (Clash Display self-hosted z
 * Fontshare — ITF Free Font License; Outfit z Google) a vystaví ich ako
 * CSS premenné, ktoré landing.css číta. Fonty sú scopnuté na tento
 * wrapper, zvyšok webu (Manrope) sa ich nedotkne.
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

/** Obal s fontovými CSS premennými — pre landing aj ďakovaciu stránku. */
export function KurzFonts({ children }: { children: React.ReactNode }) {
  return <div className={`${clash.variable} ${outfit.variable}`}>{children}</div>;
}

export function KurzShell({ locale }: { locale: Locale }) {
  return (
    <KurzFonts>
      <KurzLanding locale={locale} />
    </KurzFonts>
  );
}
