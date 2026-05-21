"use client";

import * as React from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";

/**
 * Tri kontaktné karty: Telefón / E-mail / Chat.
 * Mobile: stacked pod sebou. Desktop: 3 v rade.
 */
export function ContactCards() {
  const openChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("epoxidovo:open-chat"));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 max-w-5xl mx-auto">
      {/* KARTA 1: TELEFÓN */}
      <a
        href={`tel:${SITE.contact.phoneRaw}`}
        className="group relative flex flex-col items-center text-center bg-white text-[var(--color-fg)] rounded-2xl p-7 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)] hover:-translate-y-1 transition-all duration-300"
      >
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#16a34a] text-white shadow-[0_8px_20px_rgba(22,163,74,0.4)] mb-4">
          <Phone className="w-7 h-7" aria-hidden />
        </span>
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
          Zavolajte nám
        </h3>
        <div className="mt-3 text-xl md:text-2xl font-bold text-[#16a34a]">
          {SITE.contact.phone}
        </div>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          Po-Pi 8:00 – 17:00
        </p>
      </a>

      {/* KARTA 2: E-MAIL */}
      <a
        href={`mailto:${SITE.contact.email}`}
        className="group relative flex flex-col items-center text-center bg-white text-[var(--color-fg)] rounded-2xl p-7 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)] hover:-translate-y-1 transition-all duration-300"
      >
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3db6e8] text-white shadow-[0_8px_20px_rgba(61,182,232,0.45)] mb-4">
          <Mail className="w-7 h-7" aria-hidden />
        </span>
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
          Napíšte nám
        </h3>
        <div className="mt-3 text-lg md:text-xl font-bold text-[#3db6e8] break-all">
          {SITE.contact.email}
        </div>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          Odpovieme do 24 hodín
        </p>
      </a>

      {/* KARTA 3: CHAT */}
      <button
        type="button"
        onClick={openChat}
        className="group relative flex flex-col items-center text-center bg-white text-[var(--color-fg)] rounded-2xl p-7 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]"
      >
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f97316] text-white shadow-[0_8px_20px_rgba(249,115,22,0.45)] mb-4">
          <MessageCircle className="w-7 h-7" aria-hidden />
        </span>
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
          Online chat
        </h3>
        <span className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f97316] text-white font-semibold hover:bg-[#ea580c] shadow-[0_6px_18px_rgba(249,115,22,0.45)] transition-colors">
          Spustiť chat
        </span>
        <p className="mt-3 text-sm text-[var(--color-fg-muted)]">
          Odpovieme zvyčajne hneď
        </p>
      </button>
    </div>
  );
}
