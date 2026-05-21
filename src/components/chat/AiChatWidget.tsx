"use client";

import * as React from "react";
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

/**
 * Floating contact form — bottom-right.
 * Klik na FAB otvorí panel s krátkym formulárom (meno, email, telefón, správa).
 * Submit → POST /api/lead → email na info@epoxidovo.sk.
 *
 * Skryté na /admin a /kontakt (kde už je plný form).
 */

interface FormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  website: string; // honeypot
}

const EMPTY: FormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
  website: "",
};

export function AiChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<FormValues>(EMPTY);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [shouldHide, setShouldHide] = React.useState(false);
  const [hintHidden, setHintHidden] = React.useState(false);
  const [hintReady, setHintReady] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const firstFieldRef = React.useRef<HTMLInputElement>(null);

  // Hint bublina:
  // Desktop: show at 1.5s, hide at 5s alebo scroll > 50 (zachovaný pôvodný behavior)
  // Mobile: show at 15s, hide at 17s (2s visible okno) alebo scroll > 50
  React.useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setIsMobile(mobile);

    const showDelay = mobile ? 15000 : 1500;
    const hideDelay = mobile ? 17000 : 5000;

    const showTimer = setTimeout(() => setHintReady(true), showDelay);
    const hideTimer = setTimeout(() => setHintHidden(true), hideDelay);
    const onScroll = () => {
      if (window.scrollY > 50) setHintHidden(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Skryť widget na admin / kontakt / auth
  React.useEffect(() => {
    const update = () => {
      const path = window.location.pathname;
      setShouldHide(
        path.startsWith("/admin") || path.startsWith("/auth"),
      );
    };
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  // Focus pri otvorení
  React.useEffect(() => {
    if (open && !success) {
      setTimeout(() => firstFieldRef.current?.focus(), 200);
    }
  }, [open, success]);

  // Externý event 'epoxidovo:open-chat' (z /kontakt karty)
  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("epoxidovo:open-chat", onOpen);
    return () => window.removeEventListener("epoxidovo:open-chat", onOpen);
  }, []);

  const set = <K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (error) setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    // Klientská validácia
    if (values.name.trim().length < 2) {
      setError("Zadaj svoje meno.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setError("Zadaj platnú emailovú adresu.");
      return;
    }
    if (!values.consent) {
      setError("Musíš súhlasiť so spracovaním osobných údajov.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || undefined,
          message: values.message.trim() || undefined,
          consent: true,
          website: values.website,
          source: "floating_form",
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(
          json?.message ??
            "Odoslanie zlyhalo. Skús to znova alebo nám zavolaj.",
        );
        setSending(false);
        return;
      }

      setSuccess(true);
      setValues(EMPTY);
    } catch {
      setError("Nepodarilo sa pripojiť. Skús znovu o chvíľu.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
    setValues(EMPTY);
  };

  if (shouldHide) return null;

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Zavrieť formulár" : "Otvoriť kontaktný formulár"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 md:bottom-7 md:right-7 z-[80]",
          "inline-flex items-center justify-center rounded-full",
          "bg-gradient-to-br from-[#5fcded] via-[#3db6e8] to-[#1a8cc4]",
          "text-white shadow-[0_10px_30px_rgba(61,182,232,0.6)]",
          "hover:shadow-[0_14px_40px_rgba(61,182,232,0.75)] hover:-translate-y-0.5",
          "transition-all duration-300",
          open ? "w-12 h-12" : "w-14 h-14 md:w-16 md:h-16",
        )}
      >
        {open ? (
          <X className="w-5 h-5" aria-hidden />
        ) : (
          <MessageCircle className="w-6 h-6 md:w-7 md:h-7" aria-hidden />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" />
        )}
      </button>

      {/* Hint bublina — desktop 1.5s→5s, mobile 15s→17s (delay via JS, no animation-delay) */}
      {!open && !hintHidden && hintReady && (
        <div
          className="fixed bottom-24 right-5 md:bottom-28 md:right-7 z-[79] pointer-events-none animate-fade-up transition-opacity duration-500"
          style={{ animationFillMode: "both" }}
        >
          <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-sm text-[var(--color-fg)] font-medium max-w-[220px]">
            {isMobile ? "Spýtajte sa nás na čokoľvek" : "Opýtaj sa nás čokoľvek 👇"}
          </div>
        </div>
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Kontaktný formulár"
        className={cn(
          "fixed z-[81]",
          "bottom-3 right-3 left-3 md:bottom-7 md:right-7 md:left-auto",
          "md:w-[380px] max-h-[calc(100dvh-1.5rem)]",
          "flex flex-col rounded-2xl bg-white shadow-2xl border border-[var(--color-border)] overflow-hidden",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-[#3db6e8] to-[#1a8cc4] text-white">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15">
              <MessageCircle className="w-4 h-4" aria-hidden />
            </div>
            <div>
              <div className="font-bold text-sm">Napíš nám</div>
              <div className="text-[11px] text-white/85 leading-tight">
                Máte otázky? Neváhajte nás kontaktovať 💬
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Zavrieť"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="px-6 py-8 flex flex-col items-center text-center bg-[var(--color-bg-soft)]">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7" aria-hidden />
            </div>
            <div className="font-bold text-base mb-1">Odoslané, ďakujeme!</div>
            <p className="text-sm text-[var(--color-fg-subtle)] leading-relaxed">
              Tvoja správa došla na <strong>{SITE.contact.email}</strong>.
              Čoskoro sa ti ozveme.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 text-xs text-[#3db6e8] hover:text-[#1a8cc4] underline"
            >
              Poslať ďalšiu správu
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--color-bg-soft)]"
          >
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(e) => set("website", e.target.value)}
              className="hidden"
              aria-hidden
            />

            <div>
              <label
                htmlFor="ffc-name"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)] mb-1"
              >
                Meno
              </label>
              <input
                ref={firstFieldRef}
                id="ffc-name"
                type="text"
                required
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Meno a priezvisko"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[var(--color-border)] focus:border-[#3db6e8] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="ffc-email"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)] mb-1"
              >
                E-mail
              </label>
              <input
                id="ffc-email"
                type="email"
                required
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder=""
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[var(--color-border)] focus:border-[#3db6e8] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="ffc-phone"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)] mb-1"
              >
                Telefón <span className="text-[var(--color-fg-subtle)] normal-case font-normal">(nepovinné)</span>
              </label>
              <input
                id="ffc-phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder=""
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[var(--color-border)] focus:border-[#3db6e8] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="ffc-message"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)] mb-1"
              >
                Tvoja otázka / správa
              </label>
              <textarea
                id="ffc-message"
                rows={3}
                value={values.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Napíš nám čo ťa zaujíma — radi ti poradíme 💬"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[var(--color-border)] focus:border-[#3db6e8] focus:outline-none text-sm resize-none"
              />
            </div>

            <label className="flex items-start gap-2 text-[11px] leading-snug text-[var(--color-fg-subtle)] cursor-pointer">
              <input
                type="checkbox"
                checked={values.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-[#3db6e8] focus:ring-[#3db6e8] cursor-pointer shrink-0"
              />
              <span>
                Súhlasím so spracovaním osobných údajov podľa{" "}
                <a
                  href="/ochrana-sukromia"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-[#3db6e8]"
                >
                  zásad ochrany súkromia
                </a>
                .
              </span>
            </label>

            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-[#5fcded] via-[#3db6e8] to-[#1a8cc4] text-white font-semibold text-sm shadow-[0_8px_20px_rgba(61,182,232,0.4)] hover:shadow-[0_12px_28px_rgba(61,182,232,0.55)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Odosielam...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden />
                  Odoslať otázku
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-[var(--color-fg-subtle)] pt-1">
              Alebo nám zavolaj na{" "}
              <a
                href={`tel:${SITE.contact.phoneRaw}`}
                className="text-[#3db6e8] underline"
              >
                {SITE.contact.phone}
              </a>
            </p>
          </form>
        )}
      </div>
    </>
  );
}
