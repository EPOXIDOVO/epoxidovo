"use client";

import * as React from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

/**
 * Reusable Turnstile widget — Cloudflare CAPTCHA replacement.
 *
 * Validuje že odosielateľ formulára nie je bot. Token sa pripojí
 * k POST /api/lead → server-side verify cez CF Turnstile API.
 *
 * Usage:
 *   <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
 */

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ onVerify, onExpire }: Props) {
  const ref = React.useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // V dev (žiadny site key) preskočíme widget — vrátime fake token aby
  // formulár nebol blokovaný počas lokálneho testovania.
  React.useEffect(() => {
    if (!siteKey) {
      onVerify("dev-bypass");
    }
  }, [siteKey, onVerify]);

  if (!siteKey) {
    return (
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        ⚠️ Turnstile site key chýba (dev mode — formulár prejde bez ochrany)
      </div>
    );
  }

  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      options={{
        theme: "light",
        size: "flexible",
        language: "sk",
      }}
      onSuccess={onVerify}
      onExpire={() => {
        onExpire?.();
        ref.current?.reset();
      }}
      onError={() => {
        onExpire?.();
        ref.current?.reset();
      }}
    />
  );
}
