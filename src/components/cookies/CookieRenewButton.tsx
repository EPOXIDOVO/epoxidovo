"use client";

import * as React from "react";

/**
 * Client-only tlačidlo pre re-opening Cookiebot consent bannera.
 * Volá globálne `window.Cookiebot.renew()` — funkcia injectnutá skriptom
 * https://consent.cookiebot.com/uc.js (initovaným v `layout.tsx`).
 *
 * Prečo tlačidlo a nie Cookiebot floating widget:
 * - Floating widget rušil UX na mobile (statický overlay).
 * - GDPR vyžaduje aby withdraw bol rovnako ľahký ako súhlas — footer
 *   link "Cookies" ťa presmeruje sem, kde nájdeš toto tlačidlo.
 */
export function CookieRenewButton() {
  const handleClick = () => {
    const w = window as Window & {
      Cookiebot?: { renew?: () => void; show?: () => void };
    };
    // renew() → znovu otvorí banner s AKTUÁLNYM stavom preferencií
    // (user vidí čo mal predtým zapnuté a môže to zmeniť).
    // show() je fallback pre staršie Cookiebot verzie.
    if (w.Cookiebot?.renew) {
      w.Cookiebot.renew();
    } else if (w.Cookiebot?.show) {
      w.Cookiebot.show();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl bg-[#3db6e8] px-5 py-3 text-white font-semibold shadow-lg hover:bg-[#2ea3d3] transition-colors"
    >
      Zmeniť súhlas s cookies
    </button>
  );
}
