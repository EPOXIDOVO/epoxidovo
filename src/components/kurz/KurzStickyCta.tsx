"use client";

import * as React from "react";

/** Mobilná sticky lišta — objaví sa po odscrollovaní hero. */
export function KurzStickyCta({
  meta,
  price,
  cta,
}: {
  meta: string;
  price: string;
  cta: string;
}) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-[85] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3 px-4 pr-[5.5rem] py-3 bg-white/95 backdrop-blur border-t border-[var(--color-border)] pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <p className="text-[0.7rem] uppercase tracking-[0.15em] text-[var(--color-fg-subtle)]">
            {meta}
          </p>
          <p className="text-sm font-bold truncate">{price}</p>
        </div>
        <a
          href="#prihlaska"
          className="ml-auto shrink-0 inline-flex items-center justify-center h-11 px-5 rounded-xl bg-[var(--color-copper)] text-white text-sm font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-copper-light)]"
        >
          {cta}
        </a>
      </div>
    </div>
  );
}
