"use client";

import Script from "next/script";

/**
 * GOOGLE TAG MANAGER ONLY setup.
 *
 * Všetky tracking pixely (GA4, Meta Pixel, Google Ads conversion) sa konfigurujú
 * v GTM admine — nie tu v kóde. Tento súbor LEN nasadí GTM container.
 *
 * Custom eventy (form submit, lead) sa pushujú do `window.dataLayer` cez
 * `trackEvent()` helper — GTM si ich odchytí a forward-uje do GA/Meta/Ads.
 *
 * ENV var (voliteľná, ak nie je → použije sa hardcoded fallback):
 *   NEXT_PUBLIC_GTM_ID="GTM-5Q39NMMG"
 *
 * ----------------------------------------------------------------------------
 * STOPO — POVINNÉ TAGY V GTM (inak žiadny tracking nepôjde):
 *
 *   1. GA4 Configuration tag
 *      Measurement ID: G-NRLVXHFNSC
 *      Trigger: All Pages
 *
 *   2. GA4 Event tag
 *      Event name: generate_lead
 *      Trigger: Custom Event = "generate_lead"
 *
 *   3. Meta Pixel base code
 *      Pixel ID: 1867705137276185
 *      Trigger: All Pages
 *
 *   4. Meta Pixel "Lead" event
 *      Trigger: Custom Event = "generate_lead"
 *
 *   5. Google Ads Conversion tracking
 *      Conversion ID: AW-18114450604
 *      Conversion Label: 3H0uCLzYqbEcEKyp0r1D
 *      Trigger: Custom Event = "generate_lead"
 *
 *   6. Google Consent Mode v2 (default DENIED → update na ALLOW po consent banner)
 *
 * ----------------------------------------------------------------------------
 */

// Hardcoded fallback — funguje aj bez Netlify env premennej.
const FALLBACK_GTM_ID = "GTM-5Q39NMMG";

export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || FALLBACK_GTM_ID;

  if (!gtmId) return null;

  return (
    <>
      {/* GTM head script — async loader */}
      <Script id="gtm-loader" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>

      {/* GTM noscript fallback (pre používateľov bez JS) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager (noscript)"
        />
      </noscript>
    </>
  );
}

/**
 * Helper pre custom eventy z formulárov.
 *
 * Použitie: trackEvent('generate_lead', { source: 'cenova_ponuka' })
 *
 * Pusha event do window.dataLayer — GTM si ho zachytí a podľa konfigurácie
 * v GTM admine forward-uje do GA4, Meta Pixelu a Google Ads ako konverziu.
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;

  // Init dataLayer ak ešte neexistuje (GTM ho vytvorí, ale poistka)
  // @ts-expect-error dataLayer from GTM
  window.dataLayer = window.dataLayer || [];
  // @ts-expect-error dataLayer from GTM
  window.dataLayer.push({
    event: name,
    ...(params || {}),
  });
}
