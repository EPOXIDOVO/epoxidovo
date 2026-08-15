"use client";

import * as React from "react";
import { Check, ShoppingCart } from "lucide-react";

/**
 * Mini toast systém pre e-shop (pridanie do košíka a pod.).
 * Bez externej knižnice; <Toaster/> raz v layoute, showToast() odkiaľkoľvek.
 */

type ToastMsg = { id: number; text: string; kind: "cart" | "ok" };
type Listener = (t: ToastMsg) => void;

let listeners: Listener[] = [];
let idSeq = 1;

export function showToast(text: string, kind: ToastMsg["kind"] = "ok") {
  const msg = { id: idSeq++, text, kind };
  for (const l of listeners) l(msg);
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastMsg[]>([]);

  React.useEffect(() => {
    const onToast: Listener = (t) => {
      setItems((prev) => [...prev.slice(-2), t]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, 3200);
    };
    listeners.push(onToast);
    return () => {
      listeners = listeners.filter((l) => l !== onToast);
    };
  }, []);

  if (items.length === 0) return null;
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[95] flex flex-col items-center gap-2 px-4 w-full max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className="toast-item pointer-events-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#0e1a3b] text-white text-sm font-semibold shadow-[0_14px_40px_rgba(14,26,59,0.45)]"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300">
            {t.kind === "cart" ? (
              <ShoppingCart className="w-3.5 h-3.5" aria-hidden />
            ) : (
              <Check className="w-3.5 h-3.5" aria-hidden />
            )}
          </span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
