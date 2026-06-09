"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * SiteChrome wraps every page with Header + Footer.
 * Header is transparent-over-hero only on homepage.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // /admin and auth routes get bare layout — handled by their own layouts
  const isBareRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/auth");

  if (isBareRoute) return <>{children}</>;

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
