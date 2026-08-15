"use client";

import * as React from "react";

/**
 * Reveal — scroll-in odhalenie cez IntersectionObserver.
 *
 * Enhance-only: bez JS (alebo pri reduced-motion) je obsah normálne
 * viditeľný — trieda reveal-init sa pridáva AŽ na klilente tesne pred
 * pozorovaním, takže SSR HTML nikdy nie je skryté.
 *
 * delay: stagger v ms (použi index * 60 na položkách zoznamu).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // už vo viewporte? nechaj tak (žiadne bliknutie)
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) return;

    el.classList.add("reveal-init");
    const show = () => {
      el.classList.add("reveal-in");
      el.classList.remove("reveal-init");
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            window.setTimeout(show, delay);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    // Poistka: keby IO nikdy nevystrelil (headless render, print, bot),
    // obsah sa po 2,5 s odhalí sám — sekcia nikdy neostane prázdna.
    const failsafe = window.setTimeout(show, 2500 + delay);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delay]);

  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}
