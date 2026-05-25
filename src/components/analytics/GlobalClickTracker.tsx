"use client";

import * as React from "react";

/**
 * Globálny click delegate — chytí všetky kliky na <a href="tel:..."> +
 * <a href="mailto:..."> kdekoľvek na stránke a pushne event do GTM
 * dataLayer. Tým netreba upravovať 10+ miest s telefónnymi linkmi
 * (footer, header, hero CTA, kontakt, mestské podstránky, atď.).
 *
 * Eventy:
 *   - phone_click     → klik na tel: link
 *   - email_click     → klik na mailto: link
 *   - whatsapp_click  → klik na wa.me alebo api.whatsapp.com/send
 *
 * Mountni do <body> v root layout.tsx ako "use client" wrapper —
 * jeden listener pre celú stránku.
 */
export function GlobalClickTracker() {
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      if (!href) return;

      let event: string | null = null;
      let label: string | null = null;

      if (href.startsWith("tel:")) {
        event = "phone_click";
        label = href.replace("tel:", "").trim();
      } else if (href.startsWith("mailto:")) {
        event = "email_click";
        label = href.replace("mailto:", "").split("?")[0].trim();
      } else if (
        href.includes("wa.me/") ||
        href.includes("api.whatsapp.com/send") ||
        href.includes("whatsapp.com/")
      ) {
        event = "whatsapp_click";
        label = href;
      }

      if (!event) return;

      // Push do dataLayer — GTM si event zachytí a forwarduje do
      // GA4 / Meta / Google Ads podľa konfigurácie v GTM admine.
      // @ts-expect-error dataLayer from GTM
      window.dataLayer = window.dataLayer || [];
      // @ts-expect-error dataLayer from GTM
      window.dataLayer.push({
        event,
        link_url: href,
        link_label: label,
        link_location: location.pathname,
      });
    };

    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, []);

  return null;
}
