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

  // /ai-vizualizer = 1-page no-scroll layout (Footer hidden, main fills viewport).
  const isVisualizer = pathname.startsWith("/ai-vizualizer");

  if (isVisualizer) {
    return (
      <>
        <Header transparentOnTop={false} />
        <main id="main" className="h-[100dvh] pt-20 md:pt-24 flex flex-col">
          {children}
        </main>
        {/* Footer hidden on visualizer page for 1-page UX */}
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
