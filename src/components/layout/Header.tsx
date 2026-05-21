"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Images, Phone, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SamplePicker } from "@/components/home/SamplePicker";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

// Nav links odstránené z headera (z user briefu) — pre orientáciu zostávajú v footeri.
export const NAV_LINKS: { href: string; label: string }[] = [];

interface HeaderProps {
  transparentOnTop?: boolean;
}

/**
 * Header — 1:1 podľa pôvodného + úpravy z Docs briefu klienta:
 * - Logo vľavo + menu (Úvod / Služby / Kontakty)
 * - Vpravo 2 CTA tlačidlá (z briefu): "Cenová ponuka" + "Ukážky realizácií"
 *   POZN: predtým bolo "Mám záujem" — klient explicitne zmenil na "Cenová ponuka"
 *   a vedľa pridať "Ukážky realizácií" (otvára modal so 3 typmi priestoru)
 */
export function Header({ transparentOnTop = false }: HeaderProps) {
  const [scrolled, setScrolled] = React.useState(!transparentOnTop);
  const [open, setOpen] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!transparentOnTop) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOnTop]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isTransparent = transparentOnTop && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          isTransparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-md border-b border-[var(--color-border)]",
        )}
      >
        <Container size="xl" className="flex items-center h-20 md:h-24 gap-6">
          {/* Logo */}
          <Link href="/" aria-label="EPOXIDOVO — domov" className="shrink-0">
            <Image
              src="/images/site/logo.png"
              alt="EPOXIDOVO"
              width={180}
              height={56}
              priority
              className="h-12 md:h-14 w-auto"
            />
          </Link>

          {/* Desktop CTA — Telefón + Cenová ponuka + Ukážky realizácií.
              Telefón nad záhybom → zvyšuje konverziu pri service biznise. */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              aria-label={`Zavolať ${SITE.contact.phone}`}
              className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-full bg-[#128c7e] text-white font-semibold text-sm lg:text-base shadow-[0_6px_20px_rgba(18,140,126,0.35)] hover:bg-[#0e6b5e] hover:shadow-[0_8px_24px_rgba(14,107,94,0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Phone className="w-4 h-4" aria-hidden />
              <span className="whitespace-nowrap">{SITE.contact.phone}</span>
            </a>
            <Link href="/kontakt#cenova-ponuka" className="btn btn-primary btn-md">
              Cenová ponuka
            </Link>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="btn btn-md btn-outline"
            >
              <Images className="w-4 h-4" aria-hidden />
              Ukážky realizácií
            </button>
          </div>

          {/* Mobile: zelený pill button s telefónom (klik = zavolaj) */}
          <a
            href={`tel:${SITE.contact.phoneRaw}`}
            aria-label={`Zavolať ${SITE.contact.phone}`}
            className="md:hidden ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#128c7e] text-white font-semibold text-xs shadow-[0_4px_14px_rgba(18,140,126,0.35)] active:bg-[#0e6b5e] active:scale-95 transition-all duration-200"
          >
            <Phone className="w-4 h-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{SITE.contact.phone}</span>
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
            aria-controls="mobile-menu"
            className={cn(
              "md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-black/5 transition-colors",
              isTransparent ? "text-white" : "text-[var(--color-fg)]",
            )}
          >
            {open ? (
              <X className="w-6 h-6" aria-hidden />
            ) : (
              <Menu className="w-6 h-6" aria-hidden />
            )}
          </button>
        </Container>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden fixed inset-x-0 top-20 bottom-0 bg-white text-[var(--color-fg)] z-40",
            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none",
          )}
        >
          <nav className="flex flex-col px-6 pt-8 pb-12 gap-1">
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#f97316] text-white font-semibold hover:bg-[#ea580c] shadow-[0_8px_24px_rgba(249,115,22,0.5)] transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden />
              {SITE.contact.phone}
            </a>
            <a
              href={`https://wa.me/${SITE.contact.phoneRaw.replace(/\D/g, "")}?text=${encodeURIComponent("Dobrý deň, mám záujem o cenovú ponuku na epoxidovú podlahu.")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#25d366] text-white font-semibold hover:bg-[#1ea54f] shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              WhatsApp
            </a>
            <Link
              href="/kontakt#cenova-ponuka"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center px-6 py-4 rounded-full bg-[#3db6e8] text-white font-semibold hover:bg-[#1a8cc4] shadow-[0_8px_24px_rgba(61,182,232,0.45)] transition-colors"
            >
              Cenová ponuka
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPickerOpen(true);
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-[#3db6e8] text-[#3db6e8] font-semibold hover:bg-[#3db6e8] hover:text-white transition-colors"
            >
              <Images className="w-4 h-4" aria-hidden />
              Ukážky realizácií
            </button>
          </nav>
        </div>
      </header>

      {/* SamplePicker modal — otvára z headera aj z hero "Ukážky realizácií" */}
      <SamplePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
}
