import { Resend } from "resend";
import { SITE } from "./site";
import { bankDetails, variabilnySymbol } from "./bank";

/**
 * E-maily k objednávke kurzu.
 *
 * Prečo vlastný modul a nie sendOrderEmails z order-email.ts: e-shopový
 * e-mail je celý postavený na fyzickom tovare — doprava, hmotnosť v kg,
 * karty bezpečnostných údajov, paleta. Pri online kurze by to bolo nezmyselné
 * („Hmotnosť: 0 kg“). Dátový model (EshopOrder) sa zdieľa, e-mail nie.
 *
 * Predtým chodila objednávateľovi kurzu za 499-1499 € generická odpoveď
 * na dopyt („Ďakujeme za dopyt — ozveme sa do 24h“) a majiteľovi správa
 * nerozoznateľná od dopytu na garáž. Toto to nahrádza.
 */

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface KurzOrderEmailInput {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  /** Ľudský názov balíka, napr. „PRO s mentoringom“ */
  label: string;
  amount: number;
  payment: "karta" | "prevod";
  /** true = platba už prebehla (karta cez Stripe) */
  paid: boolean;
  company: string | null;
  ico: string | null;
  note: string | null;
  locale: "sk" | "en";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(n: number, locale: "sk" | "en"): string {
  return locale === "sk"
    ? n.toFixed(2).replace(".", ",") + " €"
    : "€" + n.toFixed(2);
}

/** CRLF a control znaky z user stringu pred vložením do subjectu. */
function safeHeader(s: string): string {
  return Array.from(s)
    .filter((ch) => ch.charCodeAt(0) >= 0x20)
    .join("")
    .slice(0, 200)
    .trim();
}

const FONT = "font-family:Arial,Helvetica,sans-serif";
const MUTED = "#5b6672";

function zhrnutie(o: KurzOrderEmailInput): string {
  const T = o.locale === "sk"
    ? { balik: "Balík", cislo: "Číslo objednávky", spolu: "Spolu", dph: "Dodávateľ nie je platiteľom DPH. Cena je konečná." }
    : { balik: "Package", cislo: "Order number", spolu: "Total", dph: "The supplier is not VAT-registered. The price is final." };
  return `
    <table style="width:100%;border-collapse:collapse;${FONT};font-size:14px;margin:16px 0">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e4eaef">${T.cislo}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e4eaef;text-align:right"><strong>${esc(o.orderId)}</strong></td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e4eaef">${T.balik}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e4eaef;text-align:right"><strong>${esc(o.label)}</strong></td>
      </tr>
      <tr>
        <td style="padding:12px 0;font-size:16px"><strong>${T.spolu}</strong></td>
        <td style="padding:12px 0;text-align:right;font-size:16px"><strong>${fmt(o.amount, o.locale)}</strong></td>
      </tr>
    </table>
    <p style="${FONT};font-size:12px;color:#8b96a2">${T.dph}</p>`;
}

/**
 * Platobný blok. Tri stavy, tri rôzne pravdy — nikdy nesľubujeme prístup
 * skôr, než ho vieme dať.
 */
function platba(o: KurzOrderEmailInput): string {
  const sk = o.locale === "sk";
  if (o.paid) {
    return `<p style="${FONT};font-size:14px">${
      sk
        ? "Platba prebehla. Prístup do kurzu ti pošleme na tento e-mail."
        : "Payment received. We will send your course access to this e-mail address."
    }</p>`;
  }
  if (o.payment === "karta") {
    // Objednávka vznikla, ale platba kartou sa dokončuje až v Stripe. Sľubovať
    // tu bankové údaje by bolo zavádzajúce — človek platí kartou, nie prevodom.
    return `<p style="${FONT};font-size:14px">${
      sk
        ? "Objednávku dokončíš platbou kartou. Hneď po zaplatení ti pošleme prístup do kurzu — ak platba neprebehla, napíš nám a pošleme ti údaje na prevod."
        : "Complete your order by paying with a card. We will send your course access right after payment. If the payment did not go through, write to us and we will send bank transfer details."
    }</p>`;
  }
  const b = bankDetails();
  if (!b) {
    // IBAN nie je nastavený — nesľubujeme číslo účtu, ktoré nemáme.
    return `<p style="${FONT};font-size:14px">${
      sk
        ? "Platobné údaje a faktúru ti pošleme e-mailom do 24 hodín. Prístup do kurzu otvoríme hneď, ako platba dorazí na účet."
        : "We will e-mail you the payment details and the invoice within 24 hours. Course access opens as soon as the payment arrives."
    }</p>`;
  }
  const vs = variabilnySymbol(o.orderId);
  const T = sk
    ? { h: "Ako zaplatiť", iban: "IBAN", maj: "Majiteľ účtu", vs: "Variabilný symbol", suma: "Suma", swift: "SWIFT / BIC",
        po: "Prístup do kurzu otvoríme hneď, ako platba dorazí na účet. Pri prevode to býva jeden pracovný deň." }
    : { h: "How to pay", iban: "IBAN", maj: "Account holder", vs: "Reference (VS)", suma: "Amount", swift: "SWIFT / BIC",
        po: "Course access opens as soon as the payment arrives, usually within one business day." };
  const row = (k: string, v: string) =>
    `<tr><td style="padding:7px 0;color:${MUTED}">${k}</td>
         <td style="padding:7px 0;text-align:right"><strong>${esc(v)}</strong></td></tr>`;
  return `
    <div style="background:#f4f7f9;border:1px solid #d5dce3;border-radius:10px;padding:16px;margin:20px 0">
      <p style="${FONT};font-size:15px;margin:0 0 8px"><strong>${T.h}</strong></p>
      <table style="width:100%;border-collapse:collapse;${FONT};font-size:14px">
        ${row(T.iban, b.iban)}
        ${row(T.maj, b.holder)}
        ${row(T.vs, vs)}
        ${row(T.suma, fmt(o.amount, o.locale))}
        ${b.swift ? row(T.swift, b.swift) : ""}
      </table>
    </div>
    <p style="${FONT};font-size:14px;color:${MUTED}">${T.po}</p>`;
}

/** Telo e-mailu pre obchod@. Exportované, aby sa dalo pozrieť bez odosielania. */
export function adminHtml(o: KurzOrderEmailInput): string {
  const cell = `padding:4px 14px 4px 0;color:${MUTED}`;
  return `
    <h2 style="${FONT}">Objednávka kurzu ${esc(o.orderId)}</h2>
    <table style="${FONT};font-size:14px;border-collapse:collapse">
      <tr><td style="${cell}">Meno</td><td><strong>${esc(o.name)}</strong></td></tr>
      <tr><td style="${cell}">E-mail</td><td><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></td></tr>
      <tr><td style="${cell}">Telefón</td><td><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></td></tr>
      ${o.company ? `<tr><td style="${cell}">Firma</td><td>${esc(o.company)}${o.ico ? ` (IČO ${esc(o.ico)})` : ""}</td></tr>` : ""}
      <tr><td style="${cell}">Balík</td><td><strong>${esc(o.label)}</strong> — ${fmt(o.amount, "sk")}</td></tr>
      <tr><td style="${cell}">Platba</td><td>${o.payment === "karta" ? "kartou (Stripe)" : "bankový prevod"}${o.paid ? " — <strong>zaplatené</strong>" : " — <strong>čaká na úhradu</strong>"}</td></tr>
      <tr><td style="${cell}">Jazyk</td><td>${o.locale.toUpperCase()}</td></tr>
    </table>
    ${o.note ? `<p style="${FONT};font-size:14px"><strong>Poznámka:</strong><br/>${esc(o.note).replace(/\n/g, "<br/>")}</p>` : ""}
    <p style="${FONT};font-size:13px;color:${MUTED}">
      ${o.paid
        ? "Platba prebehla cez Stripe. Pošli prístup do kurzu."
        : "Pošli faktúru s platobnými údajmi. Po pripísaní platby otvor prístup do kurzu."}
    </p>`;
}

/** Telo potvrdenia pre zákazníka. Exportované z rovnakého dôvodu. */
export function customerHtml(o: KurzOrderEmailInput): string {
  const sk = o.locale === "sk";
  return `
    <h2 style="${FONT}">${sk ? "Ďakujeme za objednávku" : "Thank you for your order"}</h2>
    <p style="${FONT};font-size:14px">
      ${sk
        ? `Objednávku <strong>${esc(o.orderId)}</strong> sme prijali.`
        : `We have received your order <strong>${esc(o.orderId)}</strong>.`}
    </p>
    ${zhrnutie(o)}
    ${platba(o)}
    <p style="${FONT};font-size:14px;color:${MUTED}">
      ${sk ? "Máš otázku? Napíš na" : "Any questions? Write to"}
      <a href="mailto:${SITE.contact.email}">${SITE.contact.email}</a>
      ${sk ? "alebo zavolaj na" : "or call"}
      <a href="tel:${SITE.contact.phoneRaw}">${SITE.contact.phone}</a>.
    </p>
    <p style="${FONT};font-size:12px;color:#8b96a2">${esc(SITE.legalName)}, IČO ${esc(SITE.business.ico)}</p>`;
}

/**
 * Vracia stav OBOCH e-mailov zvlášť. Resend pri chybe NEHÁDŽE výnimku —
 * vracia { error }, takže samotný try/catch by zlyhanie neodhalil a route
 * by hlásila úspech na objednávku, o ktorej sa zákazník nikdy nedozvie.
 */
export async function sendKurzOrderEmails(
  o: KurzOrderEmailInput,
): Promise<{ adminSent: boolean; customerSent: boolean }> {
  if (!resend) {
    console.warn("[kurz-order] RESEND_API_KEY nie je nastavený — e-maily preskočené");
    return { adminSent: false, customerSent: false };
  }
  const from = process.env.EMAIL_FROM ?? `EPOXIDOVO <noreply@${SITE.domain}>`;
  const meno = safeHeader(o.name);
  const sk = o.locale === "sk";
  let adminSent = false;
  let customerSent = false;

  // ── 1) obchod@ — skutočná objednávka, nie „nový dopyt" ──────────────
  try {
    const r = await resend.emails.send({
      from,
      to: [SITE.contact.email],
      replyTo: o.email,
      subject: `🎓 Objednávka kurzu ${o.orderId}: ${meno} — ${fmt(o.amount, "sk")}${o.paid ? " (ZAPLATENÉ)" : ""}`,
      html: adminHtml(o),
    });
    if (r.error) console.error("[kurz-order] obchod@ odmietnutý:", o.orderId, r.error);
    else adminSent = true;
  } catch (err) {
    console.error("[kurz-order] e-mail pre obchod zlyhal:", o.orderId, err);
  }

  // ── 2) zákazník — potvrdenie objednávky s platobnými pokynmi ────────
  try {
    const r = await resend.emails.send({
      from,
      to: [o.email],
      replyTo: SITE.contact.email,
      subject: sk
        ? `Potvrdenie objednávky ${o.orderId} | ${SITE.name}`
        : `Order confirmation ${o.orderId} | ${SITE.name}`,
      html: customerHtml(o),
    });
    if (r.error) console.error("[kurz-order] zákazník odmietnutý:", o.orderId, r.error);
    else customerSent = true;
  } catch (err) {
    console.error("[kurz-order] e-mail pre zákazníka zlyhal:", o.orderId, err);
  }

  return { adminSent, customerSent };
}
