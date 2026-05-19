/**
 * Cookie consent + Google Consent Mode v2 helper.
 *
 * 3 kategórie podľa GDPR:
 *  - necessary: vždy ON, nemôže sa odmietnuť (session cookies, CSRF)
 *  - analytics: GA4, Microsoft Clarity
 *  - marketing: Meta Pixel, Google Ads, retargeting
 *
 * Stav sa ukladá v localStorage["epoxidovo-consent"] ako JSON
 *  { necessary: true, analytics: bool, marketing: bool, timestamp: ISO }.
 *
 * Pri zmene stavu posielame Google Consent Mode v2 update cez gtag.
 */

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export const CONSENT_KEY = "epoxidovo-consent";

export function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.necessary !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(state: Omit<ConsentState, "necessary" | "timestamp">) {
  if (typeof window === "undefined") return;
  const full: ConsentState = {
    necessary: true,
    analytics: state.analytics,
    marketing: state.marketing,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
  applyConsentToGtag(full);
}

/**
 * Pošli Google Consent Mode v2 update.
 * Pred načítaním GA4/Pixel skriptov je default 'denied'.
 * Po user volbe posielame 'granted' / 'denied' explicit.
 */
export function applyConsentToGtag(state: ConsentState) {
  if (typeof window === "undefined") return;
  const w = window as Window & {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };

  // Init dataLayer (gtag stub) ak neexistuje — pre prípad keď GA4 ešte nenabehol
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
  }

  w.gtag("consent", "update", {
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
    analytics_storage: state.analytics ? "granted" : "denied",
    functionality_storage: "granted",
    personalization_storage: "granted",
    security_storage: "granted",
  });
}

/**
 * Default state pred user voľbou — všetko denied okrem necessary/security.
 * Volá sa v RootLayout pred GA4/Pixel skriptami.
 */
export function getDefaultConsentScript(): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'functionality_storage': 'granted',
      'personalization_storage': 'granted',
      'security_storage': 'granted',
      'wait_for_update': 500
    });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', true);
  `;
}
