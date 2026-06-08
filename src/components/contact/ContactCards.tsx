"use client";

import * as React from "react";
import { Phone, Mail } from "lucide-react";
import { SITE } from "@/lib/site";

/**
 * Tri kontaktné karty: Telefón / E-mail / WhatsApp.
 * Mobile: stacked pod sebou. Desktop: 3 v rade.
 */
const WHATSAPP_NUMBER = SITE.contact.phoneRaw.replace(/[^0-9]/g, ""); // 421948143981
const WHATSAPP_MSG = encodeURIComponent(
  "Dobrý deň, mám záujem o epoxidovú podlahu. Mohli by ste mi prosím poradiť?",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ContactCards() {
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

      {/* KARTA 3: WHATSAPP */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col items-center text-center bg-white text-[var(--color-fg)] rounded-2xl p-7 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
      >
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] text-white shadow-[0_8px_20px_rgba(37,211,102,0.45)] mb-4">
          <WhatsAppIcon className="w-8 h-8" />
        </span>
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
          WhatsApp
        </h3>
        <span className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-semibold hover:bg-[#1DA851] shadow-[0_6px_18px_rgba(37,211,102,0.45)] transition-colors">
          Napíšte správu
        </span>
        <p className="mt-3 text-sm text-[var(--color-fg-muted)]">
          Odpovieme do 24 hodín
        </p>
      </a>
    </div>
  );
}
