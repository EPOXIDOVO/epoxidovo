"use client";

import Link from "next/link";
import { KurzZisk } from "./KurzZisk";
import type { Locale } from "./copy";
import "./landing.css";

const T = {
  sk: { back: "← Späť na kurz", kurz: "/kurz", cta: "Chcem prístup →", ctaHref: "/kurz#cena" },
  en: { back: "← Back to the course", kurz: "/en/epoxy-flooring-course", cta: "Get access →", ctaHref: "/en/epoxy-flooring-course#cena" },
} as const;

/**
 * Samostatná stránka s veľkou (obšírnou) kalkulačkou zárobku — na landing
 * sa nevošla, vedie sem IBA tlačidlo „Koľko môžem zarobiť?" z hero
 * (majiteľ 2026-08-30). Noindex rieši metadata v page.tsx.
 */
export function KalkulackaPage({ locale }: { locale: Locale }) {
  const t = T[locale];
  return (
    <div className="kl" lang={locale}>
      <main style={{ paddingTop: "2.2rem" }}>
        <div className="kl-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <Link href={t.kurz} className="kl-btn kl-btn--line" style={{ padding: "0.7rem 1.2rem", fontSize: "0.9rem" }}>{t.back}</Link>
          <Link href={t.ctaHref} className="kl-btn kl-btn--primary" style={{ padding: "0.7rem 1.2rem", fontSize: "0.9rem" }}>{t.cta}</Link>
        </div>
        <KurzZisk locale={locale} />
      </main>
    </div>
  );
}
