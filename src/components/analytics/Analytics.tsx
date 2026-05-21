"use client";

import * as React from "react";
import Script from "next/script";

/**
 * Analytics + marketing pixels — všetko consent-gated cez Google Consent Mode v2.
 *
 * Pixely sa LOADUJÚ vždy, ale event/identity sa posielajú len ak má užívateľ
 * povolený analytics/ad_storage (cez gtag('consent','update', …)).
 * Default consent ('denied') je nastavený inline v <head> v layout.tsx
 * pred týmto skriptom.
 *
 * ENV vars:
 *   NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"          — Google Analytics 4
 *   NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXX"  — Google Ads conversion
 *   NEXT_PUBLIC_META_PIXEL_ID="1234567890"    — Meta (Facebook) Pixel
 *   NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"          — Google Tag Manager (alternative)
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <>
      {/* Google Tag Manager (ak nasadený) */}
      {gtmId && (
        <Script id="gtm-loader" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {/* GA4 — gtag.js */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });
${
  adsId
    ? `gtag('config', '${adsId}');`
    : ""
}`}
          </Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {pixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {/* GTM noscript fallback (pre používateľov bez JS) */}
      {gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager (noscript)"
          />
        </noscript>
      )}
      {pixelId && (
        // eslint-disable-next-line @next/next/no-img-element
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  );
}

/**
 * Helper pre custom conversion eventy z formulárov.
 * Použitie: trackEvent('lead_submit', { source: 'cenova_ponuka' })
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  // GA4 + Google Ads
  // @ts-expect-error gtag from script
  if (typeof window.gtag === "function") {
    // @ts-expect-error gtag from script
    window.gtag("event", name, params || {});
  }
  // Meta Pixel
  // @ts-expect-error fbq from script
  if (typeof window.fbq === "function") {
    // @ts-expect-error fbq from script
    window.fbq("trackCustom", name, params || {});
  }
  // GTM dataLayer
  // @ts-expect-error dataLayer from script
  if (Array.isArray(window.dataLayer)) {
    // @ts-expect-error dataLayer from script
    window.dataLayer.push({ event: name, ...(params || {}) });
  }
}
