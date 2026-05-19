import { Resend } from "resend";
import { SITE } from "./site";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface LeadNotifyArgs {
  name: string;
  email: string;
  phone?: string | null;
  spaceType?: string | null;
  service?: string | null;
  area?: number | null;
  message?: string | null;
  source: string;
}

/**
 * Pošle 2 emaily naraz:
 * 1) Notifikácia adminovi (info@epoxidovo.sk) — nový lead
 * 2) Auto-confirm zákazníkovi — potvrdenie že ho dostalo
 *
 * Ak nie je RESEND_API_KEY (lokálny dev), len logujeme.
 */
export async function sendLeadEmails(lead: LeadNotifyArgs) {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping email send. Lead:",
      lead,
    );
    return { skipped: true };
  }

  const fromAddress = `EPOXIDOVO <noreply@${SITE.domain}>`;

  // ===== 1) Email adminovi =====
  await resend.emails.send({
    from: fromAddress,
    to: [SITE.contact.email],
    replyTo: lead.email,
    subject: `🆕 Nový dopyt: ${lead.name}${lead.service ? ` — ${lead.service}` : ""}`,
    html: adminEmailHtml(lead),
  });

  // ===== 2) Auto-confirm zákazníkovi =====
  await resend.emails.send({
    from: fromAddress,
    to: [lead.email],
    replyTo: SITE.contact.email,
    subject: `Dostali sme tvoj dopyt — ${SITE.name}`,
    html: customerEmailHtml(lead),
  });

  return { sent: true };
}

function adminEmailHtml(lead: LeadNotifyArgs): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0a0a0a;">
  <h1 style="font-size: 22px; margin: 0 0 24px;">Nový dopyt z webu</h1>

  <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #71717a;">Meno:</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(lead.name)}</td></tr>
      <tr><td style="padding: 6px 0; color: #71717a;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>
      ${lead.phone ? `<tr><td style="padding: 6px 0; color: #71717a;">Telefón:</td><td style="padding: 6px 0;"><a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a></td></tr>` : ""}
      ${lead.spaceType ? `<tr><td style="padding: 6px 0; color: #71717a;">Typ priestoru:</td><td style="padding: 6px 0;">${escapeHtml(lead.spaceType)}</td></tr>` : ""}
      ${lead.service ? `<tr><td style="padding: 6px 0; color: #71717a;">Záujem:</td><td style="padding: 6px 0;">${escapeHtml(lead.service)}</td></tr>` : ""}
      ${lead.area ? `<tr><td style="padding: 6px 0; color: #71717a;">Plocha:</td><td style="padding: 6px 0;">${lead.area} m²</td></tr>` : ""}
      <tr><td style="padding: 6px 0; color: #71717a;">Zdroj:</td><td style="padding: 6px 0;"><code style="font-size: 12px;">${escapeHtml(lead.source)}</code></td></tr>
    </table>
  </div>

  ${
    lead.message
      ? `<div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Správa</div>
        <div style="white-space: pre-wrap;">${escapeHtml(lead.message)}</div>
      </div>`
      : ""
  }

  <p style="margin-top: 24px;">
    <a href="${SITE.url}/admin/leads" style="display: inline-block; background: #0a0a0a; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Otvoriť v admin paneli</a>
  </p>

  <p style="margin-top: 32px; font-size: 12px; color: #a1a1aa;">
    Tento email bol odoslaný automaticky z formulára na ${SITE.url}.
  </p>
</body>
</html>`;
}

function customerEmailHtml(lead: LeadNotifyArgs): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0a0a0a;">
  <h1 style="font-size: 24px; margin: 0 0 16px;">Ďakujeme, ${escapeHtml(lead.name.split(" ")[0])}!</h1>

  <p style="font-size: 16px; line-height: 1.6;">
    Dostali sme tvoj dopyt na <strong>${SITE.name}</strong>. Ozveme sa ti najneskôr <strong>do 24 hodín</strong> s ďalšími otázkami alebo cenovou ponukou.
  </p>

  <p style="font-size: 16px; line-height: 1.6;">
    Ak máš počas čakania nejaké rýchle otázky, pokojne nám zavolaj na <a href="tel:${SITE.contact.phoneRaw}" style="color: #1e40af;">${SITE.contact.phone}</a>.
  </p>

  <div style="background: #fafafa; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Tvoj dopyt</div>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      ${lead.spaceType ? `<tr><td style="padding: 4px 0; color: #71717a;">Typ priestoru:</td><td style="padding: 4px 0; font-weight: 500;">${escapeHtml(lead.spaceType)}</td></tr>` : ""}
      ${lead.service ? `<tr><td style="padding: 4px 0; color: #71717a;">Záujem:</td><td style="padding: 4px 0; font-weight: 500;">${escapeHtml(lead.service)}</td></tr>` : ""}
      ${lead.area ? `<tr><td style="padding: 4px 0; color: #71717a;">Plocha:</td><td style="padding: 4px 0; font-weight: 500;">${lead.area} m²</td></tr>` : ""}
    </table>
  </div>

  <p style="font-size: 14px; color: #52525b; line-height: 1.6;">
    Pekný deň,<br>
    tím <strong>${SITE.name}</strong>
  </p>

  <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0 16px;">

  <p style="font-size: 11px; color: #a1a1aa; line-height: 1.5;">
    ${SITE.legalName} • IČO ${SITE.business.ico} • ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}<br>
    <a href="${SITE.url}" style="color: #71717a;">${SITE.domain}</a> • <a href="tel:${SITE.contact.phoneRaw}" style="color: #71717a;">${SITE.contact.phone}</a>
  </p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
