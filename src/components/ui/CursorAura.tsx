"use client";

import * as React from "react";

/**
 * CursorAura — brand podpis interakcie (viď DESIGN_SYSTEM.md).
 *
 * Vrstvy:
 *  - bodka (presná pozícia, žiadny lag)
 *  - prstenec (lerp dobiehanie, pri hoveri interaktívneho prvku sa zväčší)
 *  - aura glow (pomalší lerp, radiálny oranžovo-modrý mix, soft-light,
 *    pri rýchlom pohybe sa mierne pretiahne v smere pohybu)
 *  - click ripple z bodu kliknutia
 *  - magnetika: elementy s [data-magnetic] sa priťahujú ku kurzoru (max 8px)
 *
 * Vypína sa: pointer: coarse (touch), prefers-reduced-motion, JS fail.
 * Kurzor nikdy neblokuje kliky (pointer-events: none) a inputy nechávajú
 * natívny text kurzor (CSS v globals).
 *
 * Použitie: <CursorAura /> raz v layoute sekcie (alebo celého webu).
 * Magnetické CTA: pridaj data-magnetic na button/link.
 */
export function CursorAura() {
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // tvrdé vypnutie na touch / reduced motion
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!dot || !ring || !glow) return;

    document.documentElement.classList.add("has-cursor-aura");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;       // ring lerp
    let gx = mx, gy = my;       // glow lerp (pomalší)
    let pmx = mx, pmy = my;     // predchádzajúca pozícia (rýchlosť)
    let raf = 0;
    let visible = false;

    // magnetika — aktuálne "chytený" element
    let magnetEl: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }

      // hover stav prstenca + magnetika
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest(
        'a, button, [role="button"], label, select, summary, input[type="range"], input[type="checkbox"], input[type="radio"]',
      );
      ring.classList.toggle("is-hover", Boolean(interactive));

      const magnet = t?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet !== magnetEl) {
        if (magnetEl) magnetEl.style.transform = "";
        magnetEl = magnet;
        if (magnetEl) {
          magnetEl.style.transition = "transform 0.25s cubic-bezier(0.16,1,0.3,1)";
        }
      }
      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2);
        const dy = my - (r.top + r.height / 2);
        // max ~8px príťah
        magnetEl.style.transform = `translate(${(dx / r.width) * 12}px, ${(dy / r.height) * 10}px)`;
      }
    };

    const onDown = (e: PointerEvent) => {
      ring.classList.add("is-down");
      // ripple z bodu kliknutia
      const ripple = document.createElement("div");
      ripple.className = "cursor-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };
    const onUp = () => ring.classList.remove("is-down");
    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      if (magnetEl) { magnetEl.style.transform = ""; magnetEl = null; }
    };

    const tick = () => {
      // lerp dobiehanie
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      gx += (mx - gx) * 0.09;
      gy += (my - gy) * 0.09;

      // rýchlosť pohybu → pretiahnutie aury v smere pohybu
      const vx = mx - pmx;
      const vy = my - pmy;
      pmx = mx; pmy = my;
      const speed = Math.min(Math.hypot(vx, vy), 60);
      const stretch = 1 + speed / 220;          // max ~1.27
      const angle = Math.atan2(vy, vx);

      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      glow.style.transform =
        `translate3d(${gx}px, ${gy}px, 0) rotate(${angle}rad) scale(${stretch}, ${2 - stretch})`;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor-aura");
      if (magnetEl) magnetEl.style.transform = "";
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-aura-glow" aria-hidden />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} aria-hidden />
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} aria-hidden />
    </>
  );
}
