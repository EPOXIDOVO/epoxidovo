"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SITE } from "@/lib/site";
import "./landing.css";

const T = {
  sk: {
    paid: "Platba prebehla, kurz je tvoj",
    prevod: "Objednávka prijatá",
    paidText: "Na e-mail ti do pár minút príde faktúra a prístup do členskej sekcie. Ak nič nevidíš, skontroluj spam alebo zavolaj.",
    prevodText: "Platobné údaje a faktúru ti pošleme e-mailom do 24 hodín. Prístup do kurzu ti aktivujeme hneď po pripísaní platby.",
    order: "Číslo objednávky",
    amount: "Suma",
    back: "Späť na stránku kurzu",
    home: "epoxidovo.sk",
    q: "Niečo nesedí? Zavolaj",
  },
  en: {
    paid: "Payment received, the course is yours",
    prevod: "Order received",
    paidText: "The invoice and access to the member area arrive in your inbox within minutes. Check spam or call us if nothing shows up.",
    prevodText: "We send the payment details and invoice by e-mail within 24 hours. Course access is activated as soon as the payment arrives.",
    order: "Order number",
    amount: "Amount",
    back: "Back to the course page",
    home: "epoxidovo.sk",
    q: "Something off? Call us",
  },
} as const;

export function KurzThanks({ locale }: { locale: "sk" | "en" }) {
  const sp = useSearchParams();
  const t = T[locale];
  const order = sp.get("o");
  const p = sp.get("p");
  const a = sp.get("a");
  const paid = p === "karta";
  const back = locale === "sk" ? "/kurz" : "/en/epoxy-flooring-course";

  return (
    <div className="kl" lang={locale}>
      <main className="kl-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <div className="kl-container" style={{ maxWidth: "46rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05, marginBottom: "1.5rem" }}>
            <span className="kl-grad">{paid ? t.paid : t.prevod}</span>
          </h1>
          <p>{paid ? t.paidText : t.prevodText}</p>
          {(order || a) && (
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "0.75rem 2rem",
                textAlign: "left",
                margin: "0 auto 2.5rem",
                maxWidth: "28rem",
                padding: "1.5rem 2rem",
                border: "1px solid var(--kl-border)",
                borderRadius: 20,
              }}
            >
              {order && (<><dt>{t.order}</dt><dd style={{ color: "#fff", margin: 0, fontFamily: "var(--kl-font-display)" }}>{order}</dd></>)}
              {a && (<><dt>{t.amount}</dt><dd style={{ color: "#fff", margin: 0, fontFamily: "var(--kl-font-display)" }}>{a} €</dd></>)}
            </dl>
          )}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={back} className="kl-btn kl-btn--primary">{t.back}</Link>
            <Link href="/" className="kl-btn kl-btn--secondary">{t.home}</Link>
          </div>
          <p style={{ marginTop: "2.5rem", fontSize: "1rem" }}>
            {t.q}: <a href={`tel:${SITE.contact.phoneRaw}`}>{SITE.contact.phone}</a>
          </p>
        </div>
      </main>
    </div>
  );
}
