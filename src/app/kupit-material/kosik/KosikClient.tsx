"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, Check, Phone, FileText } from "lucide-react";
import { useCart } from "@/lib/cart";
import { calcWeightKg } from "@/lib/calculator";
import type { PaymentMethod } from "@/lib/payments";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { trackEvent } from "@/components/analytics/Analytics";
import { SITE } from "@/lib/site";

/**
 * FÁZA 3 — košík + objednávka.
 * Ceny v UI sú informatívne z dát; záväzné ceny prepočíta server v
 * POST /api/order. Platobné metódy prichádzajú zo servera (karta sa
 * zobrazí len keď je Stripe nakonfigurovaný).
 */

interface ShippingOptionDto {
  id: string;
  label: string;
  description: string;
  priceEur: number | null;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}

const inputCls =
  "block w-full appearance-none px-4 py-3 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400";

export function KosikClient({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
  const { lines, subtotal, hasOnRequest, setQty, remove, clear, count } = useCart();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [note, setNote] = React.useState("");
  const [shippingId, setShippingId] = React.useState<"pickup" | "kurier">("pickup");
  const [paymentId, setPaymentId] = React.useState(paymentMethods[0]?.id ?? "prevod");
  const [consent, setConsent] = React.useState(false);
  const [website, setWebsite] = React.useState(""); // honeypot
  const [token, setToken] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "err">("idle");
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);

  const weightKg = calcWeightKg(
    lines.map((l) => ({
      packSizeKg: l.product.packUnit === "kg" ? l.product.packSize : null,
      qty: l.qty,
    })),
  );
  const containsHazardous = lines.some((l) => l.product.hazardous);

  // doprava — rovnaká logika ako server (informatívne)
  const shippingOptions: ShippingOptionDto[] = [
    {
      id: "pickup",
      label: "Osobný odber — Komjatná",
      description: "Školská 480, 034 96 Komjatná. Pripravíme do 24 h, zavoláme.",
      priceEur: 0,
    },
    {
      id: "kurier",
      label: "Kuriér",
      description: containsHazardous
        ? `Zásielka obsahuje chemické produkty (ADR) — cenu dopravy potvrdíme e-mailom. Hmotnosť ${weightKg} kg.`
        : `Hmotnosť ${weightKg} kg. Cenu dopravy potvrdíme e-mailom.`,
      priceEur: null,
    },
  ];
  const shipping = shippingOptions.find((s) => s.id === shippingId)!;

  const kartaDisabled = hasOnRequest || (shippingId === "kurier" && shipping.priceEur == null);

  const valid =
    name.trim().length >= 3 &&
    name.trim().includes(" ") &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    /^[+\d\s\-/()]{9,30}$/.test(phone.trim()) &&
    (shippingId === "pickup" || address.trim().length >= 8) &&
    consent;

  const submit = async () => {
    setState("sending");
    setErrMsg(null);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          note: note.trim(),
          shippingId,
          paymentId,
          consent,
          website,
          turnstileToken: token,
          items: lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            color: l.color,
            systemLabel: l.systemLabel,
          })),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        orderId?: string;
        redirectUrl?: string;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setErrMsg(json.message ?? "Objednávku sa nepodarilo odoslať — skús znova.");
        setState("err");
        return;
      }
      trackEvent("order_submit", { items: count, subtotal });
      if (json.redirectUrl) {
        window.location.href = json.redirectUrl; // Stripe Checkout
        return;
      }
      clear();
      setDone(json.orderId ?? "OK");
    } catch {
      setErrMsg("Nepodarilo sa odoslať. Skontroluj internet a skús znova.");
      setState("err");
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl bg-white p-8 md:p-12 text-center shadow-[0_18px_50px_rgba(0,0,0,0.1)] max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <Check className="w-9 h-9" aria-hidden />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900">
          Objednávka {done} prijatá
        </h2>
        <p className="mt-3 text-zinc-600">
          Potvrdenie s celým rozpisom letí na e-mail. Ozveme sa s termínom
          expedície{shippingId === "kurier" ? " a cenou dopravy" : ""}.
        </p>
        <p className="mt-4 text-sm text-zinc-500 bg-blue-50 rounded-xl p-3">
          <strong>Nejde to podľa predstáv? Zavolajte nám, dokončíme to za vás.</strong>
          <br />
          <a href={`tel:${SITE.contact.phoneRaw}`} className="font-bold text-[#3db6e8]">
            {SITE.contact.phone}
          </a>
        </p>
        <Link
          href="/kupit-material"
          className="mt-6 inline-flex px-6 py-3 rounded-full bg-zinc-100 font-semibold text-zinc-800 hover:bg-zinc-200 transition-colors"
        >
          Späť na materiály
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 md:p-12 text-center shadow-[0_18px_50px_rgba(0,0,0,0.1)] max-w-xl mx-auto">
        <ShoppingCart className="w-12 h-12 mx-auto text-zinc-300" aria-hidden />
        <h2 className="mt-4 text-2xl font-extrabold text-zinc-900">Košík je prázdny</h2>
        <p className="mt-2 text-zinc-600">
          Naplň ho kalkulátorom — vypočíta presne toľko materiálu, koľko treba.
        </p>
        <Link
          href="/kupit-material/kalkulacka"
          className="mt-6 inline-flex px-7 py-3.5 rounded-full bg-[#f97316] text-white font-bold hover:bg-[#ea580c] transition-colors"
        >
          Spustiť kalkulátor
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
      {/* položky */}
      <div className="rounded-3xl bg-white p-5 md:p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <h2 className="text-xl font-extrabold text-zinc-900 mb-4">Košík ({count})</h2>
        <div className="divide-y divide-zinc-100">
          {lines.map((l) => (
            <div key={`${l.productId}-${l.color ?? ""}`} className="py-3.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-zinc-900 text-sm leading-snug">
                  {l.product.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {l.product.packSize} {l.product.packUnit}/bal.
                  {l.color ? ` · ${l.color}` : ""}
                  {l.product.hazardous && (
                    <span className="ml-1.5 text-amber-600" title="Chemický produkt">
                      ⚠ chemický produkt
                      {l.product.sdsUrl && (
                        <>
                          {" · "}
                          <a href={l.product.sdsUrl} target="_blank" rel="noopener noreferrer" className="underline">
                            <FileText className="inline w-3 h-3" aria-hidden /> KBÚ
                          </a>
                        </>
                      )}
                    </span>
                  )}
                </div>
                {l.systemLabel && (
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-[#3db6e8]/10 text-[#1a8cc4] text-[10px] font-bold">
                    {l.systemLabel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={() => setQty(l.productId, l.qty - 1)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-100"
                  aria-label="Menej"><Minus className="w-3.5 h-3.5" aria-hidden /></button>
                <span className="w-8 text-center font-bold text-sm">{l.qty}</span>
                <button type="button" onClick={() => setQty(l.productId, l.qty + 1)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-100"
                  aria-label="Viac"><Plus className="w-3.5 h-3.5" aria-hidden /></button>
              </div>
              <div className="w-24 text-right font-extrabold text-sm shrink-0">
                {l.lineTotal != null ? fmt(l.lineTotal) : (
                  <span className="text-amber-600 font-semibold">na dopyt</span>
                )}
              </div>
              <button type="button" onClick={() => remove(l.productId)}
                className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Odstrániť"><Trash2 className="w-4 h-4" aria-hidden /></button>
            </div>
          ))}
        </div>
      </div>

      {/* checkout */}
      <div className="rounded-3xl bg-white p-5 md:p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] lg:sticky lg:top-24">
        <h2 className="text-xl font-extrabold text-zinc-900">Objednávka</h2>

        <div className="absolute -left-[9999px]" aria-hidden>
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <div className="mt-4 space-y-2.5">
          <input placeholder="Meno a priezvisko *" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} aria-label="Meno a priezvisko" autoComplete="name" />
          <input type="email" placeholder="E-mail *" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} aria-label="E-mail" autoComplete="email" />
          <input type="tel" placeholder="Telefón *" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} aria-label="Telefón" autoComplete="tel" />
        </div>

        <h3 className="mt-5 font-bold text-zinc-900 text-sm">Doprava</h3>
        <div className="mt-2 space-y-2">
          {shippingOptions.map((s) => (
            <label key={s.id} className={`block p-3 rounded-xl border-2 cursor-pointer transition-colors ${shippingId === s.id ? "border-[#3db6e8] bg-[#3db6e8]/5" : "border-zinc-200 hover:border-zinc-300"}`}>
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <input type="radio" name="shipping" checked={shippingId === s.id}
                    onChange={() => setShippingId(s.id as "pickup" | "kurier")} className="accent-[#3db6e8]" />
                  <span className="font-semibold text-sm">{s.label}</span>
                </span>
                <span className="text-sm font-bold">
                  {s.priceEur != null ? (s.priceEur === 0 ? "zadarmo" : fmt(s.priceEur)) : "potvrdíme"}
                </span>
              </span>
              <span className="block mt-1 text-xs text-zinc-500 pl-6">{s.description}</span>
            </label>
          ))}
        </div>
        {shippingId === "kurier" && (
          <input placeholder="Doručovacia adresa *" value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputCls} mt-2`} aria-label="Adresa" autoComplete="street-address" />
        )}

        <h3 className="mt-5 font-bold text-zinc-900 text-sm">Platba</h3>
        <div className="mt-2 space-y-2">
          {paymentMethods.map((m) => {
            const disabled = m.id === "karta" && kartaDisabled;
            return (
              <label key={m.id} className={`block p-3 rounded-xl border-2 transition-colors ${disabled ? "opacity-50 cursor-not-allowed border-zinc-100" : paymentId === m.id ? "border-[#3db6e8] bg-[#3db6e8]/5 cursor-pointer" : "border-zinc-200 hover:border-zinc-300 cursor-pointer"}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="payment" checked={paymentId === m.id} disabled={disabled}
                    onChange={() => setPaymentId(m.id)} className="accent-[#3db6e8]" />
                  <span className="font-semibold text-sm">{m.label}</span>
                </span>
                <span className="block mt-1 text-xs text-zinc-500 pl-6">
                  {disabled ? "Nedostupné pri položkách „na dopyt“ / nepotvrdenej doprave." : m.description}
                </span>
              </label>
            );
          })}
        </div>

        <textarea placeholder="Poznámka k objednávke" value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`${inputCls} mt-3 resize-none`} aria-label="Poznámka" />

        <div className="mt-4 rounded-xl bg-zinc-900 text-white p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-sm">{hasOnRequest ? "Medzisúčet" : "Spolu"}</span>
            <span className="text-2xl font-extrabold">{fmt(subtotal)}</span>
          </div>
          {hasOnRequest && (
            <p className="mt-1 text-xs text-amber-300">
              + položky „na dopyt" — finálnu sumu potvrdíme e-mailom.
            </p>
          )}
          {shipping.priceEur == null && shippingId === "kurier" && (
            <p className="mt-1 text-xs text-white/60">+ doprava (potvrdíme e-mailom)</p>
          )}
          <p className="mt-1.5 text-[11px] text-white/50">
            Dodávateľ nie je platiteľom DPH. Ceny sú konečné.
          </p>
        </div>

        <label className="mt-3 flex items-start gap-2 text-xs text-zinc-500 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#3db6e8]" />
          <span>Súhlasím so spracovaním osobných údajov na vybavenie objednávky. *</span>
        </label>

        <div className="mt-3 flex justify-center">
          <TurnstileWidget onVerify={setToken} onExpire={() => setToken(null)} />
        </div>

        {errMsg && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-2.5">{errMsg}</p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={state === "sending" || !valid || !token}
          className="mt-4 w-full px-6 py-4 rounded-full bg-[#f97316] text-white font-extrabold text-base hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_12px_36px_rgba(249,115,22,0.5)] transition-colors"
        >
          {state === "sending"
            ? "Odosielam…"
            : paymentId === "karta"
              ? "Objednať a zaplatiť kartou"
              : "Odoslať objednávku"}
        </button>

        <p className="mt-3 text-center text-xs text-zinc-500">
          <Phone className="inline w-3 h-3" aria-hidden /> Nejde to podľa predstáv?{" "}
          <a href={`tel:${SITE.contact.phoneRaw}`} className="font-bold text-[#3db6e8]">
            {SITE.contact.phone}
          </a>{" "}
          — dokončíme to za vás.
        </p>
      </div>
    </div>
  );
}
