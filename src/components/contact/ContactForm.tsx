"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { LeadInputSchema, type LeadInput } from "@/lib/leadSchema";
import { trackEvent } from "@/components/analytics/Analytics";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";

/**
 * Kontaktný formulár — 1:1 podľa pôvodného webu:
 * - 4 inputy v 2x2 gride (Meno / Priezvisko / Telefón / E-mail)
 * - Textarea Správa
 * - Tlačidlo Odoslať (modré pill)
 *
 * Submit POST → /api/lead (Resend email + DB save ak je available).
 * Validácia cez Zod (LeadInputSchema).
 * Honeypot anti-spam pole (skryté).
 */

type FormFields = {
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
  // honeypot
  website: string;
};

export function ContactForm() {
  const [status, setStatus] = React.useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      consent: false,
      website: "",
    },
  });

  const onSubmit = async (data: FormFields) => {
    if (!turnstileToken) {
      setServerError("Počkaj chvíľu kým sa overí, že nie si bot.");
      return;
    }
    setStatus("submitting");
    setServerError(null);

    // Map UI fields → API LeadInput schema
    const payload: LeadInput = LeadInputSchema.parse({
      name: data.name.trim(),
      email: data.email,
      phone: data.phone || undefined,
      message: data.message || undefined,
      consent: data.consent as true,
      source: "contact_form",
      website: data.website,
      turnstileToken,
    });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setServerError(
          json?.message ??
            "Niečo sa pokazilo. Skús to znovu, alebo nám zavolaj.",
        );
        setStatus("error");
        return;
      }

      reset();
      setStatus("success");
      trackEvent("generate_lead", {
        source: "contact_form",
        value: 1,
        currency: "EUR",
      });
    } catch {
      setServerError("Nepodarilo sa odoslať. Skontroluj internet a skús znovu.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-white border border-[var(--color-border)] p-8 md:p-10 text-center shadow-[var(--shadow-card)]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="w-7 h-7" aria-hidden />
        </div>
        <h3 className="mt-5 text-xl md:text-2xl font-bold tracking-tight">
          Ďakujeme!
        </h3>
        <p className="mt-3 text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed max-w-md mx-auto">
          Tvoj dopyt sme prijali. Ozveme sa ti najneskôr <strong>do 24 hodín</strong>
          {" "}s ďalšími otázkami alebo cenovou ponukou.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg)] font-medium text-sm hover:bg-[var(--color-border)] transition-colors"
        >
          Poslať ďalšiu správu
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl bg-white border border-[var(--color-border)] p-7 md:p-9 shadow-[var(--shadow-card)]"
    >
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-fg)]">
        Pošlite nám správu
      </h3>

      {/* Honeypot — skryté pole pre boty */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Web
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </label>
      </div>

      <div className="mt-6 space-y-4">
        <Field
          label="Meno / Názov spoločnosti"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name", {
            required: "Meno alebo názov spoločnosti je povinný",
            minLength: { value: 2, message: "Min 2 znaky" },
          })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Telefón"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone", {
              required: "Telefón je povinný",
              pattern: {
                value: /^[+\d\s\-/()]{9,30}$/,
                message: "Zadaj platný telefón",
              },
            })}
          />
          <Field
            label="E-mail"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email", {
              required: "E-mail je povinný",
              pattern: {
                // eslint-disable-next-line no-useless-escape
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Zadaj platný e-mail",
              },
            })}
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-[var(--color-fg)] mb-1.5"
        >
          Správa
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Popíš nám priestor, plochu (m²), typ podlahy ktorý ťa zaujíma..."
          {...register("message", {
            maxLength: { value: 2000, message: "Max 2000 znakov" },
          })}
          className="block w-full appearance-none px-4 py-3 rounded-xl border border-[var(--color-border-strong)] bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 caret-zinc-900 resize-none"
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* GDPR consent */}
      <label className="mt-5 flex items-start gap-3 text-xs text-[var(--color-fg-muted)] cursor-pointer">
        <input
          type="checkbox"
          {...register("consent", { required: "Súhlas je potrebný" })}
          className="mt-0.5 w-4 h-4 rounded border-[var(--color-border-strong)] text-[#3db6e8] focus:ring-2 focus:ring-[#3db6e8]"
        />
        <span className="leading-relaxed">
          Súhlasím so spracovaním osobných údajov za účelom kontaktovania.
          Viac v{" "}
          <a
            href="/ochrana-sukromia"
            className="underline hover:text-[#3db6e8]"
          >
            zásadách ochrany súkromia
          </a>
          .
        </span>
      </label>
      {errors.consent && (
        <p className="mt-1 text-xs text-red-600">{errors.consent.message}</p>
      )}

      {serverError && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          <span>{serverError}</span>
        </div>
      )}

      <div className="mt-5 flex justify-center">
        <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
      </div>

      <button
        type="submit"
        disabled={status === "submitting" || !turnstileToken}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(61,182,232,0.45)] hover:shadow-[0_12px_36px_rgba(61,182,232,0.6)] transition-all duration-300"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Posielam...
          </>
        ) : (
          "Odoslať"
        )}
      </button>
    </form>
  );
}

/* ===================== Field ===================== */
type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, id, ...rest },
  ref,
) {
  const inputId = id ?? `f-${label.toLowerCase().replace(/[^a-z]/g, "")}`;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-[var(--color-fg)] mb-1.5"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className="block w-full appearance-none px-4 py-3 rounded-xl border border-[var(--color-border-strong)] bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 caret-zinc-900"
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
});
