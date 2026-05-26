"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/components/analytics/Analytics";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";

interface State {
  name: string;
  email: string;
  phone: string;
  message: string;
  website: string; // honeypot
}

const EMPTY: State = {
  name: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

/**
 * Jednoduchý kontaktný formulár pod 3 kartami na /kontakt.
 * - Meno
 * - E-mail ALEBO Telefón (aspoň jedno povinné)
 * - Správa (povinné)
 */
export function ContactMessageForm() {
  const [values, setValues] = React.useState<State>(EMPTY);
  const [sending, setSending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);

  const set = <K extends keyof State>(key: K, val: State[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (error) setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    if (values.name.trim().length < 2) {
      setError("Zadaj meno.");
      return;
    }
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim());
    const hasPhone = /^[+\d\s\-/()]{9,30}$/.test(values.phone.trim());
    if (!hasEmail && !hasPhone) {
      setError("Zadaj e-mail alebo telefón (aspoň jedno).");
      return;
    }
    if (values.message.trim().length < 5) {
      setError("Napíš správu (aspoň 5 znakov).");
      return;
    }
    if (!turnstileToken) {
      setError("Počkaj chvíľu kým sa overí, že nie si bot.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      // Ak nie je email, /api/lead ho vyžaduje — pošleme placeholder s telefónom v správe.
      const emailForApi = hasEmail
        ? values.email.trim()
        : "noemail@epoxidovo.sk";
      const messageBody = [
        hasPhone && !hasEmail
          ? `Kontakt cez telefón: ${values.phone.trim()}`
          : null,
        values.message.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: emailForApi,
          phone: values.phone.trim() || undefined,
          message: messageBody,
          consent: true,
          source: "kontakt_message_form",
          website: values.website,
          turnstileToken,
        }),
      });
      if (!res.ok) {
        setError("Nepodarilo sa odoslať. Skús to prosím znova.");
        setSending(false);
        return;
      }
      setSending(false);
      setSuccess(true);
      trackEvent("contact_message", { source: "kontakt_message_form" });
      trackEvent("generate_lead", {
        source: "kontakt_message_form",
        value: 1,
        currency: "EUR",
      });
    } catch {
      setError("Nepodarilo sa odoslať. Skús to prosím znova.");
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-white border border-[var(--color-border)] p-7 md:p-9 text-center shadow-[var(--shadow-card)] max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <CheckCircle2 className="w-8 h-8" aria-hidden />
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--color-fg)]">
          Správa odoslaná
        </h3>
        <p className="mt-2 text-sm md:text-base text-[var(--color-fg-muted)]">
          Ďakujeme — čoskoro sa ti ozveme.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg)] font-medium text-sm hover:bg-[var(--color-border)] transition-colors"
        >
          Späť na úvod
        </Link>
      </div>
    );
  }

  const inputCls =
    "block w-full appearance-none px-4 py-3 rounded-xl border border-[var(--color-border-strong)] bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 caret-zinc-900";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl bg-white border border-[var(--color-border)] p-6 md:p-9 shadow-[var(--shadow-card)] max-w-2xl mx-auto"
    >
      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--color-fg)]">
        Pošlite správu
      </h3>
      <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
        Krátka otázka alebo nezáväzný dopyt — odpovieme čoskoro.
      </p>

      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Web
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="msg-name"
            className="block text-sm font-semibold text-[var(--color-fg)] mb-1.5"
          >
            Meno *
          </label>
          <input
            id="msg-name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="msg-email"
              className="block text-sm font-semibold text-[var(--color-fg)] mb-1.5"
            >
              E-mail
            </label>
            <input
              id="msg-email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label
              htmlFor="msg-phone"
              className="block text-sm font-semibold text-[var(--color-fg)] mb-1.5"
            >
              Telefón
            </label>
            <input
              id="msg-phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <p className="text-xs text-[var(--color-fg-muted)] -mt-2">
          Aspoň jedno z dvojice (e-mail alebo telefón) je povinné.
        </p>
        <div>
          <label
            htmlFor="msg-message"
            className="block text-sm font-semibold text-[var(--color-fg)] mb-1.5"
          >
            Správa *
          </label>
          <textarea
            id="msg-message"
            rows={4}
            required
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Napíš nám čo ťa zaujíma…"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex justify-center">
        <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
      </div>

      <button
        type="submit"
        disabled={sending || !turnstileToken}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#3db6e8] text-white font-semibold hover:bg-[#1a8cc4] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(61,182,232,0.45)] transition-all duration-300"
      >
        {sending ? "Posielame…" : "Odoslať správu"}
      </button>
    </form>
  );
}
