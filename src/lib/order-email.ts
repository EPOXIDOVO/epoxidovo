import { Resend } from "resend";
import { SITE } from "./site";
import type { Product } from "@/data/products";

/**
 * FÁZA 3 — e-maily objednávky (Resend).
 * 1) obchod@ — nová objednávka s celým rozpisom
 * 2) zákazník — potvrdenie s rozpisom + KBÚ linky pri hazardous produktoch
 *
 * Ceny sú konečné — v e-mailoch je poznámka o neplatiteľovi DPH.
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface OrderLineEmail {
  product: Product;
  qty: number;
  color?: string;
  systemLabel?: string;
  lineTotal: number | null;
}

export interface OrderEmailInput {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  lines: OrderLineEmail[];
  subtotal: number;
  hasOnRequest: boolean;
  shippingLabel: string;
  shippingPrice: number | null;
  paymentLabel: string;
  weightKg: number;
  note: string | null;
}

const VAT_NOTE =
  "Dodávateľ nie je platiteľom DPH. Ceny sú konečné.";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}

function linesTable(lines: OrderLineEmail[]): string {
  const rows = lines
    .map((l) => {
      const kbu = l.product.hazardous
        ? l.product.sdsUrl
          ? `<br/><a href="${esc(l.product.sdsUrl)}" style="color:#3db6e8;font-size:12px">Karta bezpečnostných údajov (KBÚ)</a>`
          : `<br/><span style="color:#b45309;font-size:12px">Chemický produkt — KBÚ na vyžiadanie</span>`
        : "";
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">
          <strong>${esc(l.product.name)}</strong>
          ${l.color ? `<br/><span style="font-size:12px;color:#555">Odtieň: ${esc(l.color)}</span>` : ""}
          ${l.systemLabel ? `<br/><span style="font-size:12px;color:#888">Skladba: ${esc(l.systemLabel)}</span>` : ""}
          ${kbu}
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${l.qty}×</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">
          ${l.lineTotal != null ? fmt(l.lineTotal) : "na dopyt"}
        </td>
      </tr>`;
    })
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows}</table>`;
}

function summaryHtml(o: OrderEmailInput): string {
  return `
    ${linesTable(o.lines)}
    <table style="width:100%;font-family:Arial,sans-serif;font-size:14px;margin-top:12px">
      <tr><td>Doprava: ${esc(o.shippingLabel)}</td>
          <td style="text-align:right">${o.shippingPrice != null ? fmt(o.shippingPrice) : "cenu potvrdíme"}</td></tr>
      <tr><td>Platba: ${esc(o.paymentLabel)}</td><td></td></tr>
      <tr><td>Hmotnosť: ${o.weightKg} kg</td><td></td></tr>
      <tr><td style="padding-top:10px;font-size:16px"><strong>${o.hasOnRequest ? "Medzisúčet (bez položiek na dopyt)" : "Spolu"}</strong></td>
          <td style="padding-top:10px;text-align:right;font-size:16px"><strong>${fmt(o.subtotal)}</strong></td></tr>
    </table>
    ${o.hasOnRequest ? `<p style="font-family:Arial;font-size:13px;color:#b45309">Objednávka obsahuje položky bez potvrdenej ceny — finálnu sumu potvrdíme e-mailom pred expedíciou.</p>` : ""}
    <p style="font-family:Arial;font-size:12px;color:#888">${VAT_NOTE}</p>
  `;
}

export async function sendOrderEmails(o: OrderEmailInput): Promise<{ sent: boolean }> {
  if (!resend) {
    console.warn("[order] RESEND_API_KEY not set — emails NOT sent");
    return { sent: false };
  }
  const from = process.env.EMAIL_FROM ?? `EPOXIDOVO <noreply@${SITE.domain}>`;
  const safeName = Array.from(o.name)
    .filter((ch) => ch.charCodeAt(0) >= 0x20)
    .join("")
    .slice(0, 120);

  // 1) obchod@
  try {
    await resend.emails.send({
      from,
      to: [SITE.contact.email],
      replyTo: o.email,
      subject: `🛒 Objednávka ${o.orderId}: ${safeName} — ${fmt(o.subtotal)}`,
      html: `
        <h2 style="font-family:Arial">Nová objednávka ${esc(o.orderId)}</h2>
        <p style="font-family:Arial;font-size:14px">
          <strong>${esc(o.name)}</strong><br/>
          ${esc(o.email)} · ${esc(o.phone)}<br/>
          ${o.address ? esc(o.address) : "— osobný odber —"}
        </p>
        ${o.note ? `<p style="font-family:Arial;font-size:13px;background:#fef3c7;padding:8px">Poznámka: ${esc(o.note)}</p>` : ""}
        ${summaryHtml(o)}
      `,
    });
  } catch (err) {
    console.error("[order] admin email failed:", err);
  }

  // 2) zákazník
  try {
    const hazardousLines = o.lines.filter((l) => l.product.hazardous);
    await resend.emails.send({
      from,
      to: [o.email],
      replyTo: SITE.contact.email,
      subject: `Potvrdenie objednávky ${o.orderId} | ${SITE.name}`,
      html: `
        <h2 style="font-family:Arial">Ďakujeme za objednávku!</h2>
        <p style="font-family:Arial;font-size:14px">
          Objednávku <strong>${esc(o.orderId)}</strong> sme prijali a ozveme sa
          s potvrdením expedície${o.shippingPrice == null ? " a cenou dopravy" : ""}.
        </p>
        ${summaryHtml(o)}
        ${
          hazardousLines.length
            ? `<p style="font-family:Arial;font-size:13px;color:#555">
                Objednávka obsahuje chemické produkty — karty bezpečnostných
                údajov (KBÚ) sú pri položkách vyššie, prípadne vám ich radi
                pošleme na vyžiadanie.</p>`
            : ""
        }
        <p style="font-family:Arial;font-size:14px;background:#eff6ff;padding:10px;border-radius:8px">
          <strong>Nejde to podľa predstáv? Zavolajte nám, dokončíme to za vás.</strong><br/>
          📞 <a href="tel:${SITE.contact.phoneRaw}">${SITE.contact.phone}</a>
        </p>
      `,
    });
  } catch (err) {
    console.error("[order] customer email failed:", err);
  }

  return { sent: true };
}
