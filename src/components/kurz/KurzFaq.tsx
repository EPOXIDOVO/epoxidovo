"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { KURZ_FAQ } from "@/content/kurz";

export function KurzFaq() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
      {KURZ_FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-start justify-between gap-6 py-5 text-left transition-colors hover:text-[var(--color-brand-deep)]"
            >
              <span className="text-base md:text-lg font-semibold tracking-tight">
                {item.q}
              </span>
              <Plus
                aria-hidden
                className={`w-5 h-5 shrink-0 mt-1 text-[var(--color-fg-subtle)] transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed max-w-3xl">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
