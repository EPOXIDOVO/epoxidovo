"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie, Settings2, Check, X } from "lucide-react";
import {
  getStoredConsent,
  saveConsent,
  applyConsentToGtag,
  type ConsentState,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

/**
 * Cookie banner — self-hosted, GDPR-compliant, s Google Consent Mode v2.
 * Zobrazí sa pri prvej návšteve. Zatvára sa po výbere.
 *
 * Pre opätovné otvorenie: footer link "Cookies" alebo
 * window.dispatchEvent(new Event('open-cookie-settings')).
 */
export function CookieBanner() {
  const [open, setOpen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(true);
  const [marketing, setMarketing] = React.useState(true);

  // Initial mount: ak nie je decision, zobraz banner; aplikuj uložený stav do gtag
  React.useEffect(() => {
    const existing = getStoredConsent();
    if (existing) {
      applyConsentToGtag(existing);
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
      return;
    }
    // No decision yet — open banner
    setOpen(true);
  }, []);

  // Listen na 'open-cookie-settings' event (z footer linku)
  React.useEffect(() => {
    const onOpen = () => {
      const existing = getStoredConsent();
      if (existing) {
        setAnalytics(existing.analytics);
        setMarketing(existing.marketing);
      }
      setShowSettings(true);
      setOpen(true);
    };
    window.addEventListener("open-cookie-settings", onOpen);
    return () => window.removeEventListener("open-cookie-settings", onOpen);
  }, []);

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setAnalytics(true);
    setMarketing(true);
    setOpen(false);
  };

  const rejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
    setAnalytics(false);
    setMarketing(false);
    setOpen(false);
  };

  const saveCustom = () => {
    saveConsent({ analytics, marketing });
    setOpen(false);
    setShowSettings(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-modal="false"
      className="fixed bottom-0 inset-x-0 z-[90] p-3 md:p-5 pointer-events-none"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-3xl bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden",
          "animate-fade-up",
        )}
      >
        {!showSettings ? (
          <BannerView
            onAcceptAll={acceptAll}
            onRejectAll={rejectAll}
            onCustomize={() => setShowSettings(true)}
          />
        ) : (
          <SettingsView
            analytics={analytics}
            marketing={marketing}
            onAnalyticsChange={setAnalytics}
            onMarketingChange={setMarketing}
            onSave={saveCustom}
            onBack={() => setShowSettings(false)}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

/** Hlavný banner pohľad */
function BannerView({
  onAcceptAll,
  onRejectAll,
  onCustomize,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
}) {
  return (
    <div className="p-5 md:p-6">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#3db6e8]/10">
          <Cookie className="w-5 h-5 text-[#3db6e8]" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            id="cookie-banner-title"
            className="text-base md:text-lg font-bold text-[var(--color-fg)] tracking-tight"
          >
            Používame cookies
          </h2>
          <p className="mt-1.5 text-sm text-[var(--color-fg-muted)] leading-relaxed">
            Pre fungovanie webu nutné cookies sú vždy aktívne. Pre analytiku a
            marketing potrebujeme tvoj súhlas. Viac v{" "}
            <Link
              href="/cookies"
              className="underline underline-offset-2 hover:text-[#3db6e8]"
            >
              zásadách cookies
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={onAcceptAll}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] transition-colors"
        >
          <Check className="w-4 h-4" aria-hidden />
          Prijať všetky
        </button>
        <button
          type="button"
          onClick={onRejectAll}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg)] font-semibold text-sm hover:bg-[var(--color-border)] transition-colors"
        >
          Iba nutné
        </button>
        <button
          type="button"
          onClick={onCustomize}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-transparent border border-[var(--color-border-strong)] text-[var(--color-fg)] font-semibold text-sm hover:bg-[var(--color-bg-muted)] transition-colors"
        >
          <Settings2 className="w-4 h-4" aria-hidden />
          Upraviť
        </button>
      </div>
    </div>
  );
}

/** Settings — toggles pre kategórie */
function SettingsView({
  analytics,
  marketing,
  onAnalyticsChange,
  onMarketingChange,
  onSave,
  onBack,
  onClose,
}: {
  analytics: boolean;
  marketing: boolean;
  onAnalyticsChange: (v: boolean) => void;
  onMarketingChange: (v: boolean) => void;
  onSave: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <h2 className="text-base md:text-lg font-bold text-[var(--color-fg)] tracking-tight">
          Nastavenia cookies
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavrieť"
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>

      <div className="space-y-3">
        <Category
          title="Nutné"
          description="Bez nich web nefunguje (session, CSRF). Tieto sú vždy aktívne."
          checked
          disabled
        />
        <Category
          title="Analytika"
          description="Google Analytics, Microsoft Clarity. Anonymne meriame návštevnosť a funkčnosť."
          checked={analytics}
          onChange={onAnalyticsChange}
        />
        <Category
          title="Marketing"
          description="Meta Pixel, Google Ads. Personalizácia reklám a retargeting."
          checked={marketing}
          onChange={onMarketingChange}
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] transition-colors"
        >
          <Check className="w-4 h-4" aria-hidden />
          Uložiť voľbu
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-transparent border border-[var(--color-border-strong)] text-[var(--color-fg)] font-semibold text-sm hover:bg-[var(--color-bg-muted)] transition-colors"
        >
          Späť
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--color-fg-subtle)] leading-relaxed">
        Voľbu môžeš kedykoľvek zmeniť cez link „Cookies" v pätke webu.
      </p>
    </div>
  );
}

function Category({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[var(--color-border)]">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-[var(--color-fg)]">
          {title}
          {disabled && (
            <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)] font-normal">
              povinné
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)] leading-relaxed">
          {description}
        </p>
      </div>
      <Toggle
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked
          ? disabled
            ? "bg-[#3db6e8]/40"
            : "bg-[#3db6e8]"
          : "bg-[var(--color-border-strong)]",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
