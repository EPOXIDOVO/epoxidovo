"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Images, Phone, Home } from "lucide-react";
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
          {/* Logo — CSS wordmark (perfectly crisp na Retine, žiadny PNG upscale).
              Pôvodný logo.png mal len 285×50 px → bol rozmazaný na hi-DPI displejoch.
              Farba sa prepína podľa scroll stavu: white nad hero, dark po scrolle. */}
          <Link
            href="/"
            aria-label="EPOXIDOVO — domov"
            className="shrink-0 relative z-20 touch-manipulation active:opacity-70 transition-opacity"
          >
            <span
              className={cn(
                "block text-4xl md:text-5xl font-extrabold tracking-tight leading-none transition-colors duration-300",
                isTransparent ? "text-white" : "text-[#0a0f1e]",
              )}
              style={{
                WebkitTextStroke: isTransparent
                  ? "1px rgba(0,0,0,0.85)"
                  : "0.5px rgba(0,0,0,0.4)",
                paintOrder: "stroke fill",
                textShadow: isTransparent
                  ? "0 3px 8px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.9)"
                  : "0 2px 4px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              <span className="text-[#3db6e8]">EPOXID</span>OVO<span aria-hidden className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#3db6e8] mx-1 align-baseline mb-1 shadow-[0_2px_4px_rgba(0,0,0,0.4)]"></span>SK
            </span>
          </Link>

          {/* Desktop CTA — Kontakt (zelená pill) + Cenová ponuka + Ukážky realizácií. */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-full bg-[#16a34a] text-white font-semibold text-sm lg:text-base shadow-[0_6px_20px_rgba(22,163,74,0.4)] hover:bg-[#15803d] hover:shadow-[0_8px_24px_rgba(21,128,61,0.55)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Phone className="w-4 h-4" aria-hidden />
              <span className="whitespace-nowrap">Kontakt</span>
            </Link>
            <Link href="/cenova-ponuka" className="btn btn-primary btn-md">
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

          {/* Mobile hamburger — výrazne vpravo hore */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
            aria-controls="mobile-menu"
            className={cn(
              "md:hidden ml-auto inline-flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-colors",
              isTransparent
                ? "text-white border-white/40 hover:bg-white/10"
                : "text-[var(--color-fg)] border-[var(--color-border)] hover:bg-black/5",
            )}
          >
            {open ? (
              <X className="w-7 h-7" aria-hidden />
            ) : (
              <Menu className="w-7 h-7" aria-hidden strokeWidth={2.5} />
            )}
          </button>
        </Container>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden fixed inset-x-0 top-20 h-[calc(100dvh-5rem)] bg-white text-[var(--color-fg)] z-40 overflow-y-auto",
            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none",
          )}
        >
          <nav className="flex flex-col px-6 pt-8 pb-12 gap-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-zinc-300 text-zinc-700 font-semibold hover:bg-zinc-100 transition-colors"
            >
              <Home className="w-4 h-4" aria-hidden />
              Domovská stránka
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPickerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-[#3db6e8] text-[#3db6e8] font-semibold hover:bg-[#3db6e8] hover:text-white transition-colors"
            >
              <Images className="w-4 h-4" aria-hidden />
              Ukážky realizácií
            </button>
            <Link
              href="/cenova-ponuka"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center px-6 py-4 rounded-full bg-[#f97316] text-white font-semibold hover:bg-[#ea580c] shadow-[0_8px_24px_rgba(249,115,22,0.5)] transition-colors"
            >
              Cenová ponuka
            </Link>
            <Link
              href="/kontakt"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#16a34a] text-white font-semibold hover:bg-[#15803d] shadow-[0_8px_24px_rgba(22,163,74,0.4)] transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden />
              Kontakt
            </Link>
          </nav>
        </div>
      </header>

      {/* SamplePicker modal — otvára z headera aj z hero "Ukážky realizácií" */}
      <SamplePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
}
