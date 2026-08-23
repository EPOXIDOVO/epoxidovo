"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { EshopHeader } from "./EshopHeader";
import { Footer } from "./Footer";

/**
 * SiteChrome wraps every page with Header + Footer.
 * Header is transparent-over-hero only on homepage.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Landing kurzu (SK + EN) má vlastnú hlavičku, pätu aj tmavý dizajn
  // (1:1 podľa TicketWave) — globálne chrome by sa s ním bilo.
  const isKurzLanding =
    pathname === "/kurz" || pathname.startsWith("/en/epoxy-flooring-course");
  if (isKurzLanding) {
    return <main id="main">{children}</main>;
  }

  // Obchodná časť má vlastnú commerce hlavičku ako Epodex/GymBeam — logo +
  // search + košík, bez servisných CTA. Patrí sem aj konfigurátor a
  // vzorkovník, lebo z nich vedie cesta do košíka, nie do dopytu.
  const isShop =
    pathname.startsWith("/eshop") ||
    pathname.startsWith("/kupit-material") ||
    pathname.startsWith("/navrhni-podlahu") ||
    pathname.startsWith("/vzorkovnik") ||
    pathname.startsWith("/metalicka-podlaha");

  // v konfigurátore a vzorkovníku je zákazník uprostred rozhodovania —
  // vyhľadávanie ho len odvádza inam
  const bezVyhladavania =
    pathname.startsWith("/navrhni-podlahu") ||
    pathname.startsWith("/vzorkovnik") ||
    pathname.startsWith("/metalicka-podlaha");

  if (isShop) {
    return (
      <>
        <EshopHeader bezVyhladavania={bezVyhladavania} />
        <main id="main" className="flex-1 pt-[104px]">
          {children}
        </main>
        <Footer />
      </>
    );
  }

  // 1-page no-scroll layout pre /ai-vizualizer + /cenova-ponuka
  // (Footer hidden, main fills viewport, žiadny dlhý scroll dolu).
  const is1PageRoute =
    pathname.startsWith("/ai-vizualizer") ||
    pathname.startsWith("/cenova-ponuka");

  if (is1PageRoute) {
    return (
      <>
        <Header transparentOnTop={false} />
        {/* Mobile: prirodzený flow s natívnym scrollom (form/CTA potrebuje miesto).
            Desktop: 1-page no-scroll layout (h-[100dvh] + flex). */}
        <main
          id="main"
          className="pt-20 md:pt-24 md:h-[100dvh] md:flex md:flex-col md:overflow-hidden"
        >
          {children}
        </main>
        {/* Footer hidden on this route for 1-page UX */}
      </>
    );
  }

  return (
    <>
      <Header transparentOnTop={isHome} />
      <main id="main" className="flex-1 pt-20 md:pt-24">
        {children}
      </main>
      <Footer />
    </>
  );
}
