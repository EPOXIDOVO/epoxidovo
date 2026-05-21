"use client";

import * as React from "react";
import Image from "next/image";
import { Infinity as InfinityIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Stats counter — social proof čísla.
 * V pozadí pohyblivé SVG vzory podláh (chipsy / mramor / metalické / jednofarebné).
 */

interface Stat {
  value: number | string;
  suffix?: string;
  label: string;
  isStatic?: boolean;
}

const STATS: Stat[] = [
  { value: 200, suffix: "+", label: "Realizovaných projektov" },
  { value: "∞", label: "Možných dizajnov", isStatic: true },
  { value: 20, suffix: "+", label: "Rokov životnosť podlahy" },
];

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const duration = 1400;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

/* =========================================================
   SVG vzory podláh — každý je 400×400 tile
   ========================================================= */

function ChipsovePattern() {
  // Deterministicky rozhádzané flakes — chipsy
  const flakes = React.useMemo(() => {
    const seeded = (s: number) => {
      let x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    const colors = ["#3a2a1f", "#5c3a2a", "#1f2a3a", "#2a3a5c", "#0e1320", "#7a5a3a"];
    const round = (n: number) => Math.round(n * 100) / 100;
    return Array.from({ length: 90 }, (_, i) => ({
      x: round(seeded(i * 1.1) * 400),
      y: round(seeded(i * 2.3) * 400),
      w: round(6 + seeded(i * 3.7) * 14),
      h: round(4 + seeded(i * 4.1) * 8),
      r: round(seeded(i * 5.9) * 360),
      c: colors[Math.floor(seeded(i * 6.7) * colors.length)],
    }));
  }, []);

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <rect width="400" height="400" fill="#d8cfc2" />
      <rect width="400" height="400" fill="url(#chipsGrain)" opacity="0.25" />
      <defs>
        <radialGradient id="chipsGrain" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0e1320" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      {flakes.map((f, i) => (
        <rect
          key={i}
          x={f.x}
          y={f.y}
          width={f.w}
          height={f.h}
          rx="1.5"
          fill={f.c}
          transform={`rotate(${f.r} ${f.x + f.w / 2} ${f.y + f.h / 2})`}
        />
      ))}
    </svg>
  );
}

function MramorovePattern() {
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="marbleBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f0e8" />
          <stop offset="100%" stopColor="#cfc4b0" />
        </linearGradient>
        <linearGradient id="marbleVein1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a3a2a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1f2a3a" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#marbleBase)" />
      <path
        d="M-20 80 Q 80 40, 160 110 T 320 90 T 480 140"
        stroke="url(#marbleVein1)"
        strokeWidth="3"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M-20 180 Q 60 220, 140 180 T 280 200 T 480 170"
        stroke="#2a1f1a"
        strokeWidth="1.5"
        fill="none"
        opacity="0.45"
      />
      <path
        d="M-20 260 Q 100 290, 180 250 T 340 280 T 480 250"
        stroke="#3a2a1f"
        strokeWidth="2.5"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M-20 340 Q 70 310, 150 350 T 300 330 T 480 360"
        stroke="#1f1a14"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M40 -20 Q 80 80, 50 160 T 100 320 T 60 480"
        stroke="#2a1f1a"
        strokeWidth="1.2"
        fill="none"
        opacity="0.35"
      />
      <path
        d="M260 -20 Q 240 100, 290 200 T 250 380 T 280 480"
        stroke="#3a2a1f"
        strokeWidth="1.8"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

function MetalickePattern() {
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id="metalSwirl" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#5fa8d4" />
          <stop offset="35%" stopColor="#1a5a8c" />
          <stop offset="70%" stopColor="#0e2540" />
          <stop offset="100%" stopColor="#050a18" />
        </radialGradient>
        <radialGradient id="metalShine" cx="70%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#c0e0f0" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#1a5a8c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="metalStreak" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#a8d0e8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#metalSwirl)" />
      <rect width="400" height="400" fill="url(#metalShine)" />
      <path
        d="M-50 200 Q 80 150, 150 220 T 280 180 T 450 240"
        stroke="url(#metalStreak)"
        strokeWidth="40"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M-50 80 Q 100 130, 200 90 T 350 120 T 450 80"
        stroke="url(#metalStreak)"
        strokeWidth="20"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M-50 320 Q 120 280, 200 330 T 380 300 T 450 340"
        stroke="url(#metalStreak)"
        strokeWidth="28"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}

function JednofarebnePattern() {
  // Sivá betónová matná podlaha s jemnou textúrou
  const dots = React.useMemo(() => {
    const seeded = (s: number) => {
      let x = Math.sin(s * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    const round = (n: number) => Math.round(n * 100) / 100;
    return Array.from({ length: 200 }, (_, i) => ({
      x: round(seeded(i + 1) * 400),
      y: round(seeded(i + 100) * 400),
      r: round(0.5 + seeded(i + 200) * 1.5),
      o: round(0.1 + seeded(i + 300) * 0.3),
    }));
  }, []);

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="solidBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9aa0a8" />
          <stop offset="100%" stopColor="#6a7078" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#solidBase)" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#1a1f2a" opacity={d.o} />
      ))}
    </svg>
  );
}

function PhotoPattern({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(max-width: 768px) 55vw, (max-width: 1024px) 28vw, 22vw"
      className="object-cover"
      aria-hidden
    />
  );
}

const PATTERNS = [
  // Realne fotky podláh z realizacii — vybraté pre maximálnu viditeľnosť povrchu
  { key: "hala-priemysel", Component: () => <PhotoPattern src="/images/realizacie/r-19.jpg" /> },
  { key: "metalicke-closeup", Component: () => <PhotoPattern src="/images/realizacie/r-35.jpg" /> },
  { key: "mramor-blue-swirl", Component: () => <PhotoPattern src="/images/realizacie/r-32.jpg" /> },
  { key: "mramor-white", Component: () => <PhotoPattern src="/images/realizacie/r-37.webp" /> },
  { key: "jednofarebne-living", Component: () => <PhotoPattern src="/images/realizacie/r-40.jpg" /> },
];

export function Stats() {
  return (
    <section className="relative bg-[#0e1320] text-white py-10 md:py-20 border-y border-white/5 overflow-hidden">
      {/* Mobile + desktop — pohyblivé fotky vzorov podláh v pozadí (right → left) */}
      <div
        aria-hidden
        className="flex pointer-events-none absolute inset-0 w-max animate-stats-marquee"
      >
        {[...PATTERNS, ...PATTERNS, ...PATTERNS].map(({ key, Component }, i) => (
          <div
            key={`${key}-${i}`}
            className="relative h-full w-[55vw] md:w-[28vw] lg:w-[22vw] shrink-0"
          >
            <Component />
          </div>
        ))}
      </div>
      {/* Tmavý overlay — na mobile silnejší kvôli čitateľnosti čísel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#0e1320]/70 md:bg-[#0e1320]/15"
      />

      <Container size="xl" className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 md:gap-y-10 gap-x-12 text-center max-w-4xl mx-auto divide-y divide-white/10 md:divide-y-0">
          {STATS.map((s) => (
            <div key={s.label} className="relative isolate pt-4 first:pt-0 md:pt-0">
              {/* Lokálne radial halo — len za textom, vzory mimo zostávajú jasné */}
              <div
                aria-hidden
                className="hidden md:block absolute inset-x-[-15%] inset-y-[-20%] -z-10 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(14,19,32,0.85)_0%,_rgba(14,19,32,0.55)_45%,_rgba(14,19,32,0)_75%)] blur-md"
              />
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white h-[3rem] md:h-[3rem] lg:h-[3.75rem] flex items-center justify-center leading-none [text-shadow:0_2px_12px_rgba(0,0,0,0.9),_0_0_4px_rgba(0,0,0,0.7)]">
                {s.isStatic ? (
                  s.value === "∞" ? (
                    <InfinityIcon
                      className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 stroke-[2.75] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                      aria-label="nekonečno"
                    />
                  ) : (
                    <span>
                      {s.value}
                      {s.suffix ?? ""}
                    </span>
                  )
                ) : (
                  <CountUp to={s.value as number} suffix={s.suffix ?? ""} />
                )}
              </div>
              <div className="mt-2 md:mt-3 text-[10px] md:text-sm font-bold text-zinc-100 uppercase tracking-[0.18em] md:tracking-[0.12em] leading-snug [text-shadow:0_1px_6px_rgba(0,0,0,0.95),_0_0_2px_rgba(0,0,0,0.8)]">
                {s.label}
              </div>
              {/* Akcentová oranžová linka pod popisom — len mobile */}
              <div className="md:hidden mt-2 mx-auto h-[2px] w-8 rounded-full bg-[#f97316]" aria-hidden />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
