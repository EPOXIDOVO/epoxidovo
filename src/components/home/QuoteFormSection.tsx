"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LeadInputSchema, type LeadInput } from "@/lib/leadSchema";

/**
 * QuoteFormSection — sekcia "Cenová ponuka" s kontaktným formulárom.
 * Submit POST → /api/lead (Resend admin+customer email, Prisma save ak je DB).
 *
 * Polia:
 *  - meno (req), tel (req), email (req)
 *  - plocha m² (opt), typ podlahy (opt dropdown), mesto (opt), správa (opt)
 *  - GDPR consent (req)
 *
 * Responzívne: na md+ 2 stĺpce, na mobile 1 stĺpec.
 */

type FormFields = {
  name: string;
  phone: string;
  email: string;
  area: string;
  service: "" | "jednofarebne" | "chipsove" | "mramorove" | "metalicke" | "priemyselne" | "neviem";
  city: string;
  message: string;
  consent: boolean;
  website: string; // honeypot
};

const SERVICE_OPTIONS: { value: FormFields["service"]; label: string }[] = [
  { value: "jednofarebne", label: "Hladké jednofarebné" },
  { value: "chipsove", label: "Chipsové" },
  { value: "mramorove", label: "Mramorové" },
  { value: "metalicke", label: "Metalické" },
  { value: "priemyselne", label: "Priemyselné" },
  { value: "neviem", label: "Neviem / poradíte" },
];

export function QuoteFormSection() {
  const [status, setStatus] = React.useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = React.useState<string | null>(null);

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
      area: "",
      service: "",
      city: "",
      message: "",
      consent: false,
      website: "",
    },
  });

  const onSubmit = async (data: FormFields) => {
    setStatus("submitting");
    setServerError(null);

    // City zlúčime do message (DB schema nemá city stĺpec)
    const fullMessage = [
      data.city ? `Lokalita: ${data.city.trim()}` : null,
      data.message ? data.message.trim() : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const payload: LeadInput = LeadInputSchema.parse({
      name: data.name.trim(),
      email: data.email,
      phone: data.phone,
      area: data.area || undefined,
      service: data.service || undefined,
      message: fullMessage || undefined,
      consent: data.consent as true,
      source: "quote_form_home",
      website: data.website,
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
          json?.message ?? "Niečo sa pokazilo. Skús to znovu, alebo nám zavolaj.",
        );
        setStatus("error");
        return;
      }
      reset();
      setStatus("success");
    } catch {
      setServerError("Nepodarilo sa odoslať. Skontroluj internet a skús znovu.");
      setStatus("error");
    }
  };

  return (
    <section
      id="cenova-ponuka"
      className="relative bg-[var(--color-copper)] text-white overflow-hidden"
    >
      <Container size="xl" className="py-14 md:py-24 lg:py-28">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[0.7rem] md:text-xs font-extrabold uppercase tracking-[0.18em] text-white">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" aria-hidden />
            CENOVÁ PONUKA
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
            <span className="text-[#3db6e8]">Napíš nám.</span>
            <br />
            Ozveme sa do 24 hodín.
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/85 leading-relaxed">
            Pošli nám pár detailov a obratom ti pošleme nezáväznú cenovú ponuku
            na epoxidovú alebo polyuretánovú podlahu na mieru.
          </p>
        </div>

        {/* Karta s formulárom alebo success */}
        <div className="mt-8 md:mt-12 max-w-3xl mx-auto">
          {status === "success" ? (
            <div className="rounded-2xl bg-white text-[var(--color-fg)] p-8 md:p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" aria-hidden />
              </div>
              <h3 className="mt-5 text-2xl md:text-3xl font-bold tracking-tight">
                Ďakujeme!
              </h3>
              <p className="mt-3 text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed max-w-md mx-auto">
                Tvoj dopyt sme prijali. Ozveme sa ti najneskôr{" "}
                <strong>do 24 hodín</strong> s cenovou ponukou.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg)] font-medium text-sm hover:bg-[var(--color-border)] transition-colors"
              >
                Poslať ďalší dopyt
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-2xl bg-white text-[var(--color-fg)] p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              {/* Honeypot */}
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

              {/* 2-col grid na md+, 1-col na mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <Field
                  label="Meno a priezvisko"
                  required
                  autoComplete="name"
                  placeholder="Jozef Mrkvička"
                  error={errors.name?.message}
                  {...register("name", {
                    required: "Meno je povinné",
                    minLength: { value: 2, message: "Min 2 znaky" },
                  })}
                />
                <Field
                  label="Telefón"
                  required
                  type="tel"
                  autoComplete="tel"
                  placeholder="+421 9XX XXX XXX"
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
                  label="Email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="jozef@email.sk"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email je povinný",
                    pattern: {
                      // eslint-disable-next-line no-useless-escape
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Zadaj platný email",
                    },
                  })}
                />
                <Field
                  label="Plocha (m²)"
                  type="number"
                  inputMode="numeric"
                  placeholder="napr. 35"
                  error={errors.area?.message}
                  {...register("area", {
                    pattern: { value: /^\d*$/, message: "Iba čísla" },
                  })}
                />

                {/* Select — typ podlahy */}
                <div>
                  <label
                    htmlFor="service"
                    className="block text-sm font-medium text-[var(--color-fg)] mb-1.5"
                  >
                    Typ podlahy
                  </label>
                  <select
                    id="service"
                    {...register("service")}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-strong)] bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent text-sm text-zinc-900"
                  >
                    <option value="">— vyber typ —</option>
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Field
                  label="Mesto / lokalita"
                  autoComplete="address-level2"
                  placeholder="napr. Ružomberok"
                  {...register("city")}
                />
              </div>

              {/* Správa — full width */}
              <div className="mt-4 md:mt-5">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[var(--color-fg)] mb-1.5"
                >
                  Správa
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Popíš nám priestor, terminálne predstavy, otázky…"
                  {...register("message", {
                    maxLength: { value: 2000, message: "Max 2000 znakov" },
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 caret-zinc-900 resize-none"
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* GDPR */}
              <label className="mt-5 flex items-start gap-3 text-xs text-[var(--color-fg-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  {...register("consent", { required: "Súhlas je potrebný" })}
                  className="mt-0.5 w-4 h-4 rounded border-[var(--color-border-strong)] text-[#f97316] focus:ring-2 focus:ring-[#f97316]"
                />
                <span className="leading-relaxed">
                  Súhlasím so spracovaním osobných údajov za účelom kontaktovania.
                  Viac v{" "}
                  <a
                    href="/ochrana-sukromia"
                    className="underline hover:text-[#f97316]"
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

              {/* Submit — oranžový */}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#f97316] text-white font-bold text-base hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_36px_rgba(249,115,22,0.65)] transition-all duration-300"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                    Posielam…
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" aria-hidden />
                    Pošlite mi cenovú ponuku
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}

/* ===================== Field ===================== */
type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
};

const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, id, required, ...rest },
  ref,
) {
  const inputId = id ?? `qf-${label.toLowerCase().replace(/[^a-z]/g, "")}`;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-[var(--color-fg)] mb-1.5"
      >
        {label}
        {required && <span className="text-[#f97316] ml-0.5">*</span>}
      </label>
      <input
        ref={ref}
        id={inputId}
        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 caret-zinc-900"
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
});
