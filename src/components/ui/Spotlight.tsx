"use client";

import * as React from "react";

/**
 * SpotlightCard — karta so spotlight gradientom sledujúcim kurzor
 * (--mx/--my CSS premenné, vizuál v globals.css .spotlight-card::after)
 * + voliteľný jemný 3D tilt (max ~5°, len fine pointer, reduced-motion off).
 *
 * Použitie:
 *   <SpotlightCard className="rounded-3xl ..."> ... </SpotlightCard>
 */
export function SpotlightCard({
  children,
  className = "",
  tilt = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** 3D tilt pri hoveri (max 5°). */
  tilt?: boolean;
  as?: "div" | "article" | "section";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const enabled = React.useRef(false);

  React.useEffect(() => {
    enabled.current =
      !window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || !enabled.current) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${px}%`);
    el.style.setProperty("--my", `${py}%`);
    if (tilt) {
      const tx = (py / 100 - 0.5) * -5; // rotateX
      const ty = (px / 100 - 0.5) * 5;  // rotateY
      el.style.transform = `perspective(900px) rotateX(${tx}deg) rotateY(${ty}deg)`;
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    if (tilt) el.style.transform = "";
  };

  return (
    <Tag
      ref={ref as React.Ref<never>}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`spotlight-card ${tilt ? "transition-transform duration-300" : ""} ${className}`}
      style={tilt ? { transformStyle: "preserve-3d" } : undefined}
    >
      {children}
    </Tag>
  );
}
