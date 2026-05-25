"use client";

import * as React from "react";
import Link from "next/link";
import { X, Home, Car, Factory, ArrowRight } from "lucide-react";
import { SPACE_TYPES } from "@/content/categories";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Car,
  Factory,
};

interface SamplePickerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal pre "Ukážky podláh" v Hero (z Docs briefu klienta).
 * 3 typy priestoru → po výbere → galéria fotiek danej kategórie.
 */
export function SamplePicker({ open, onClose }: SamplePickerProps) {
  // Close on ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-picker-title"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        "transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Zavrieť"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer",
          "transition-opacity duration-300",
        )}
        tabIndex={open ? 0 : -1}
      />

      {/* Panel — kompaktné "popup" okno, centrované, fit na 1 screen
          (nie full-height bottom-sheet). Mobile aj desktop rovnaký rounded-3xl. */}
      <div
        className={cn(
          "relative w-full max-w-md md:max-w-2xl mx-auto",
          "bg-white text-[var(--color-fg)]",
          "rounded-3xl",
          "shadow-2xl",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
        )}
      >
        {/* Close — 3D biela bublina s X. Sticky aby ostalo viditeľné aj pri
            scrolle obsahu modalu. Radial gradient + inset highlights = pop-out
            look, hover scale 110% + tieň-up signalizuje interaktivitu, active
            scale 90% + X rotácia = jasný press feedback. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavrieť okno"
          className="group absolute top-4 right-4 z-10 inline-flex items-center justify-center w-12 h-12 md:w-12 md:h-12 rounded-full text-zinc-900 ring-2 ring-black/15 transition-all duration-200 ease-out hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3db6e8]/60"
          style={{
            background: "radial-gradient(120% 120% at 30% 25%, #ffffff 0%, #f4f4f5 70%, #e4e4e7 100%)",
            boxShadow:
              "0 8px 22px rgba(0,0,0,0.22), 0 3px 8px rgba(0,0,0,0.14), inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -3px 6px rgba(0,0,0,0.10)",
          }}
        >
          <X
            className="w-5 h-5 md:w-6 md:h-6 group-hover:text-[#1a8cc4] group-active:rotate-90 transition-all duration-200"
            strokeWidth={3}
            aria-hidden
          />
        </button>

        <div className="px-4 md:px-10 pt-7 md:pt-12 pb-5 md:pb-10">
          <div className="text-center max-w-lg mx-auto">
            {/* Eyebrow v bubline */}
            <span className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[0.65rem] md:text-xs font-black uppercase tracking-[0.18em] text-[var(--color-brand)]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" aria-hidden />
              Ukážky realizácií
            </span>
            <h2
              id="sample-picker-title"
              className="mt-2 md:mt-4 text-xl md:text-3xl lg:text-4xl font-black tracking-tight text-[var(--color-fg)] leading-[1.1] md:whitespace-nowrap"
            >
              O aký typ priestoru ide?
            </h2>
            <p className="mt-1.5 md:mt-4 text-sm md:text-xl font-bold text-[var(--color-fg)] leading-snug">
              Vyber kde plánuješ podlahu.
            </p>
          </div>

          {/* 3 možnosti — vždy 3 stĺpce, aj na mobile (kompaktné horizontálne) */}
          <div className="mt-4 md:mt-8 grid grid-cols-3 gap-2 md:gap-3">
            {SPACE_TYPES.map((space) => {
              const Icon = ICONS[space.icon] ?? Home;
              return (
                <Link
                  key={space.slug}
                  href={`/realizacie?priestor=${space.slug}`}
                  onClick={onClose}
                  className={cn(
                    "group relative flex flex-col items-center text-center",
                    "rounded-xl md:rounded-2xl border-2 border-[var(--color-border)]",
                    "px-1.5 py-3 md:p-8",
                    "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "hover:border-[var(--color-fg)] hover:shadow-[var(--shadow-card)] hover:-translate-y-1",
                    "focus-visible:border-[var(--color-fg)]",
                  )}
                >
                  <div className="flex items-center justify-center w-11 h-11 md:w-16 md:h-16 rounded-full bg-[var(--color-fg)] text-white group-hover:bg-[var(--color-brand)] transition-colors duration-300 shadow-[0_6px_14px_rgba(10,15,30,0.18)]">
                    <Icon className="w-5 h-5 md:w-8 md:h-8" aria-hidden />
                  </div>
                  <h3 className="mt-2 md:mt-4 font-black text-[13px] md:text-2xl text-[var(--color-fg)] tracking-tight">
                    {space.name}
                  </h3>
                  <p className="hidden md:block mt-2 text-sm md:text-base font-semibold text-[var(--color-fg)]/85 leading-snug">
                    {space.description}
                  </p>
                  <span className="hidden md:inline-flex mt-4 items-center gap-1 text-sm font-bold text-[var(--color-brand)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Pozrieť realizácie
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
