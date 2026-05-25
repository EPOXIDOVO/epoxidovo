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
  // Voliteľné polia — ak budú niekedy vo forme, email ich automaticky vykreslí.
  city?: string | null; // {{lokalita}}
  timeline?: string | null; // {{termin}}
}

/**
 * Pošle 2 emaily naraz:
 * 1) Notifikácia adminovi (info@epoxidovo.sk) — nový lead
 * 2) Auto-confirm zákazníkovi — potvrdenie že ho dostalo
 *
 * Email templates používajú table-based layout + inline styles pre
 * maximálnu kompatibilitu (Gmail, Apple Mail, Outlook, Yahoo).
 */
export async function sendLeadEmails(lead: LeadNotifyArgs) {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping email send. Lead:",
      lead,
    );
    return { skipped: true };
  }

  const fromAddress =
    process.env.EMAIL_FROM ?? `EPOXIDOVO <noreply@${SITE.domain}>`;

  // ===== 1) Email adminovi =====
  try {
    await resend.emails.send({
      from: fromAddress,
      to: [SITE.contact.email],
      replyTo: lead.email,
      subject: `🆕 Nový dopyt: ${lead.name}${lead.service ? ` — ${lead.service}` : ""}`,
      html: adminEmailHtml(lead),
    });
  } catch (err) {
    console.error("[email] admin notification failed:", err);
  }

  // ===== 2) Auto-confirm zákazníkovi =====
  try {
    await resend.emails.send({
      from: fromAddress,
      to: [lead.email],
      replyTo: SITE.contact.email,
      subject: `Ďakujeme za dopyt — ozveme sa do 24h | ${SITE.name}`,
      html: customerEmailHtml(lead),
    });
  } catch (err) {
    console.error("[email] customer auto-confirm failed:", err);
  }

  return { sent: true };
}

// ─────────────────────────────────────────────────────────────────────
// SHARED EMAIL STYLES
// ─────────────────────────────────────────────────────────────────────

const BRAND_BLUE = "#3db6e8";
const BRAND_BLUE_DARK = "#1a8cc4";
const BRAND_NAVY = "#0a0f1e";
const BG_SOFT = "#f4f7fb";
const BORDER = "#e2e8f0";
const TEXT = "#0f172a";
const TEXT_MUTED = "#64748b";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// ─────────────────────────────────────────────────────────────────────
// ADMIN EMAIL — notifikácia pre tím
// ─────────────────────────────────────────────────────────────────────

function adminEmailHtml(lead: LeadNotifyArgs): string {
  const sourceLabel = sourceLabelFor(lead.source);

  return `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nový dopyt — ${escapeHtml(lead.name)}</title>
</head>
<body style="margin:0;padding:0;background:${BG_SOFT};font-family:${FONT_STACK};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BG_SOFT};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,15,30,0.08);">

          <!-- HEADER s brand gradientom -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_NAVY} 0%,${BRAND_BLUE_DARK} 100%);padding:32px 32px 28px;">
              <div style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;">
                <span style="color:${BRAND_BLUE};">EPOXID</span><span style="opacity:0.7;">OVO·SK</span>
              </div>
              <h1 style="margin:14px 0 4px;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.02em;">
                🆕 Nový dopyt
              </h1>
              <div style="color:rgba(255,255,255,0.7);font-size:14px;">
                ${escapeHtml(new Date().toLocaleString("sk-SK", { timeZone: "Europe/Bratislava", dateStyle: "long", timeStyle: "short" }))}
              </div>
            </td>
          </tr>

          <!-- ZÁKAZNÍK info card -->
          <tr>
            <td style="padding:28px 32px 4px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${TEXT_MUTED};margin-bottom:10px;">
                Zákazník
              </div>
              <div style="font-size:22px;font-weight:800;color:${TEXT};letter-spacing:-0.01em;">
                ${escapeHtml(lead.name)}
              </div>
            </td>
          </tr>

          <!-- KONTAKT CTA tlačidlá -->
          <tr>
            <td style="padding:18px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${
                    lead.phone
                      ? `<td width="50%" style="padding-right:6px;">
                        <a href="tel:${escapeHtml(lead.phone)}" style="display:block;background:#16a34a;color:#ffffff;text-decoration:none;text-align:center;padding:14px 16px;border-radius:10px;font-size:15px;font-weight:700;">
                          📞 ${escapeHtml(lead.phone)}
                        </a>
                      </td>
                      <td width="50%" style="padding-left:6px;">
                        <a href="mailto:${escapeHtml(lead.email)}" style="display:block;background:${BRAND_BLUE};color:#ffffff;text-decoration:none;text-align:center;padding:14px 16px;border-radius:10px;font-size:15px;font-weight:700;">
                          ✉️ Odpovedať
                        </a>
                      </td>`
                      : `<td>
                        <a href="mailto:${escapeHtml(lead.email)}" style="display:block;background:${BRAND_BLUE};color:#ffffff;text-decoration:none;text-align:center;padding:14px 16px;border-radius:10px;font-size:15px;font-weight:700;">
                          ✉️ Odpovedať na ${escapeHtml(lead.email)}
                        </a>
                      </td>`
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- DETAILY dopytu -->
          <tr>
            <td style="padding:24px 32px 4px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${TEXT_MUTED};margin-bottom:12px;">
                Detaily dopytu
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BG_SOFT};border-radius:12px;">
                ${detailRow("E-mail", `<a href="mailto:${escapeHtml(lead.email)}" style="color:${BRAND_BLUE_DARK};text-decoration:none;font-weight:600;">${escapeHtml(lead.email)}</a>`)}
                ${lead.phone ? detailRow("Telefón", `<a href="tel:${escapeHtml(lead.phone)}" style="color:${BRAND_BLUE_DARK};text-decoration:none;font-weight:600;">${escapeHtml(lead.phone)}</a>`) : ""}
                ${lead.spaceType ? detailRow("Typ priestoru", escapeHtml(spaceTypeLabel(lead.spaceType))) : ""}
                ${lead.service ? detailRow("Druh podlahy", escapeHtml(serviceLabel(lead.service))) : ""}
                ${lead.area ? detailRow("Plocha", `<strong>${lead.area} m²</strong>`) : ""}
                ${detailRow("Zdroj", `<span style="display:inline-block;background:${BRAND_BLUE}15;color:${BRAND_BLUE_DARK};padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">${escapeHtml(sourceLabel)}</span>`, true)}
              </table>
            </td>
          </tr>

          ${
            lead.message
              ? `<!-- SPRÁVA -->
          <tr>
            <td style="padding:24px 32px 4px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${TEXT_MUTED};margin-bottom:12px;">
                Správa od zákazníka
              </div>
              <div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 18px;color:${TEXT};font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(lead.message)}</div>
            </td>
          </tr>`
              : ""
          }

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 32px 28px;">
              <div style="border-top:1px solid ${BORDER};padding-top:20px;text-align:center;">
                <div style="font-size:12px;color:${TEXT_MUTED};line-height:1.6;">
                  Tento email bol odoslaný automaticky z formulára na <a href="${SITE.url}" style="color:${BRAND_BLUE_DARK};text-decoration:none;font-weight:600;">${SITE.domain}</a>.<br>
                  Klikni <strong>Odpovedať</strong> a email pôjde priamo zákazníkovi.
                </div>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────
// CUSTOMER EMAIL — auto-confirm pre zákazníka
// ─────────────────────────────────────────────────────────────────────

const BRAND_ORANGE = "#C05A30";
const BRAND_ORANGE_DARK = "#9A4824";
const FOOTER_BG = "#1a1a2e";
const FOOTER_TEXT = "#cbd5e1";
const SOFT_GRAY = "#f3f4f6";

// Fixed gallery — 3 reprezentatívne fotky, vždy rovnaké poradie
// (priemyselná, metalická, hladká biela jednofarebná).
// Absolutné URL pre email klientov.
const GALLERY_3 = [
  { src: "/images/realizacie/r-22.jpg", alt: "Priemyselná podlaha v hale — EPOXIDOVO" },
  { src: "/images/realizacie/r-32.jpg", alt: "Metalická podlaha v bývaní — EPOXIDOVO" },
  { src: "/images/realizacie/r-03.jpg", alt: "Hladká biela jednofarebná podlaha — EPOXIDOVO" },
];

function customerEmailHtml(lead: LeadNotifyArgs): string {
  const firstName = lead.name.split(" ")[0];
  const whatsappNumber = SITE.contact.phoneRaw.replace(/[^0-9]/g, "");
  const datumDopytu = new Date().toLocaleDateString("sk-SK", {
    timeZone: "Europe/Bratislava",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const realizacie = GALLERY_3;
  const bearLogoUrl = `${SITE.url}/images/site/logo_v2.png`;

  // Box "Čo si nám poslal" — iba ak je niečo vyplnené
  const hasAnyDetail =
    lead.spaceType || lead.service || lead.area || lead.city || lead.timeline || lead.message;

  return `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Ďakujeme za dopyt — ${SITE.name}</title>
</head>
<body style="margin:0;padding:0;background:${BG_SOFT};font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;">
  <!-- Preheader (skrytý preview text v inbox liste) -->
  <div style="display:none;font-size:1px;color:${BG_SOFT};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Ahoj ${escapeHtml(firstName)}! Tvoj dopyt sme prijali — ozveme sa do 24 hodín s cenovou ponukou.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BG_SOFT};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,15,30,0.08);">

          <!-- ═══ HLAVIČKA — oranžový banner s wordmarkom rovnakým ako na webe ═══ -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_ORANGE} 0%,${BRAND_ORANGE_DARK} 100%);padding:36px 32px;text-align:center;">
              <div style="color:#ffffff;font-size:34px;font-weight:900;letter-spacing:-0.02em;line-height:1;text-shadow:0 2px 8px rgba(0,0,0,0.3);">
                <span style="color:${BRAND_BLUE};">EPOXID</span>OVO<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${BRAND_BLUE};vertical-align:middle;margin:0 6px 4px;"></span>SK
              </div>
              <div style="margin-top:10px;color:rgba(255,255,255,0.92);font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                Epoxidové a polyuretánové podlahy na mieru
              </div>
            </td>
          </tr>

          <!-- ═══ POZDRAV + ÚVOD ═══ -->
          <tr>
            <td style="padding:36px 32px 8px;">
              <h1 style="margin:0 0 16px;font-size:30px;font-weight:800;color:${TEXT};letter-spacing:-0.02em;line-height:1.2;">
                Ahoj ${escapeHtml(firstName)}! 👋
              </h1>
              <p style="margin:0;font-size:16px;line-height:1.65;color:${TEXT};">
                Ďakujeme za tvoj záujem o <strong>liatu podlahu od Epoxidovo</strong>. Tvoj dopyt sme úspešne prijali a ozveme sa ti najneskôr <strong>do 24 hodín</strong> s cenovou ponukou alebo doplňujúcimi otázkami.
              </p>
            </td>
          </tr>

          ${
            hasAnyDetail
              ? `<!-- ═══ BOX "ČO SI NÁM POSLAL" ═══ -->
          <tr>
            <td style="padding:28px 32px 0;">
              <div style="background:${SOFT_GRAY};border-radius:14px;padding:24px;">
                <div style="font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${TEXT_MUTED};margin-bottom:14px;">
                  📋 Čo si nám poslal
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${lead.area ? customerDetailRow("Plocha", `${lead.area} m²`) : ""}
                  ${lead.service ? customerDetailRow("Typ podlahy", escapeHtml(serviceLabel(lead.service))) : ""}
                  ${lead.spaceType ? customerDetailRow("Typ priestoru", escapeHtml(spaceTypeLabel(lead.spaceType))) : ""}
                  ${lead.city ? customerDetailRow("Lokalita", escapeHtml(lead.city)) : ""}
                  ${lead.timeline ? customerDetailRow("Termín realizácie", escapeHtml(lead.timeline)) : ""}
                  ${customerDetailRow("Dátum dopytu", escapeHtml(datumDopytu), true)}
                </table>
                ${
                  lead.message
                    ? `<div style="margin-top:16px;padding:14px 16px;background:#ffffff;border-radius:10px;border-left:4px solid ${BRAND_ORANGE};">
                  <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${TEXT_MUTED};margin-bottom:6px;">
                    Doplňujúce info
                  </div>
                  <div style="font-size:14px;color:${TEXT};line-height:1.55;white-space:pre-wrap;">${escapeHtml(lead.message)}</div>
                </div>`
                    : ""
                }
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- ═══ CTA TLAČIDLÁ — Tel + WhatsApp + Email (bulletproof email buttons) ═══ -->
          <tr>
            <td style="padding:32px 32px 8px;text-align:center;">
              <div style="font-size:17px;font-weight:700;color:${TEXT};margin-bottom:18px;line-height:1.45;">
                V prípade otázok nám môžeš zavolať<br>alebo napísať na WhatsApp / Email
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <!-- Telefón button -->
                  <td width="33.33%" align="center" valign="middle" style="padding-right:4px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                      <tr>
                        <td align="center" valign="middle" bgcolor="#16a34a" style="background:#16a34a;border-radius:12px;box-shadow:0 4px 14px rgba(22,163,74,0.35);">
                          <a href="tel:${SITE.contact.phoneRaw}" style="display:block;padding:16px 8px;color:#ffffff;text-decoration:none;font-family:${FONT_STACK};font-size:14px;font-weight:700;line-height:1;border-radius:12px;mso-padding-alt:0;">
                            📞&nbsp;Zavolať
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- WhatsApp button -->
                  <td width="33.33%" align="center" valign="middle" style="padding:0 4px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                      <tr>
                        <td align="center" valign="middle" bgcolor="#25D366" style="background:#25D366;border-radius:12px;box-shadow:0 4px 14px rgba(37,211,102,0.35);">
                          <a href="https://wa.me/${whatsappNumber}" style="display:block;padding:16px 8px;color:#ffffff;text-decoration:none;font-family:${FONT_STACK};font-size:14px;font-weight:700;line-height:1;border-radius:12px;mso-padding-alt:0;">
                            💬&nbsp;WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Email button -->
                  <td width="33.33%" align="center" valign="middle" style="padding-left:4px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                      <tr>
                        <td align="center" valign="middle" bgcolor="${BRAND_BLUE}" style="background:${BRAND_BLUE};border-radius:12px;box-shadow:0 4px 14px rgba(61,182,232,0.4);">
                          <a href="mailto:${SITE.contact.email}" style="display:block;padding:16px 8px;color:#ffffff;text-decoration:none;font-family:${FONT_STACK};font-size:14px;font-weight:700;line-height:1;border-radius:12px;mso-padding-alt:0;">
                            ✉️&nbsp;Email
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div style="margin-top:16px;font-size:14px;color:${TEXT};font-weight:600;">
                <a href="tel:${SITE.contact.phoneRaw}" style="color:${BRAND_ORANGE_DARK};text-decoration:none;font-weight:700;">${SITE.contact.phone}</a>
                <span style="color:${TEXT_MUTED};font-weight:400;"> · Po-Pi 8:00 – 17:00</span>
              </div>
            </td>
          </tr>

          <!-- ═══ GALÉRIA REALIZÁCIÍ ═══ -->
          <tr>
            <td style="padding:36px 32px 8px;text-align:center;">
              <div style="font-size:18px;font-weight:700;color:${TEXT};margin-bottom:18px;">
                📸 Inšpiruj sa realizáciami
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${realizacie
                    .map(
                      (item, i) => `<td width="33.33%" style="padding:${i === 0 ? "0 4px 0 0" : i === 1 ? "0 2px" : "0 0 0 4px"};">
                    <a href="${SITE.url}/realizacie" style="display:block;text-decoration:none;">
                      <img src="${SITE.url}${item.src}" alt="${escapeHtml(item.alt)}" width="100%" style="display:block;width:100%;max-width:200px;height:auto;border-radius:10px;border:0;outline:none;">
                    </a>
                  </td>`,
                    )
                    .join("")}
                </tr>
              </table>
              <div style="margin-top:20px;">
                <a href="${SITE.url}/realizacie" style="display:inline-block;background:#ffffff;color:${BRAND_ORANGE_DARK};text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;border:2px solid ${BRAND_ORANGE};">
                  Pozri všetky →
                </a>
              </div>
            </td>
          </tr>

          <!-- ═══ SOCIAL PROOF — 3 stĺpce ═══ -->
          <tr>
            <td style="padding:36px 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${SOFT_GRAY};border-radius:14px;">
                <tr>
                  <td width="33.33%" style="padding:20px 8px;text-align:center;border-right:1px solid ${BORDER};">
                    <div style="font-size:28px;line-height:1;margin-bottom:6px;">⭐</div>
                    <div style="font-size:16px;font-weight:800;color:${TEXT};">200+</div>
                    <div style="font-size:11px;color:${TEXT_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">realizácií</div>
                  </td>
                  <td width="33.33%" style="padding:20px 8px;text-align:center;border-right:1px solid ${BORDER};">
                    <div style="font-size:28px;line-height:1;margin-bottom:6px;">🏆</div>
                    <div style="font-size:16px;font-weight:800;color:${TEXT};">20+ rokov</div>
                    <div style="font-size:11px;color:${TEXT_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">životnosti</div>
                  </td>
                  <td width="33.33%" style="padding:20px 8px;text-align:center;">
                    <div style="font-size:28px;line-height:1;margin-bottom:6px;">✅</div>
                    <div style="font-size:16px;font-weight:800;color:${TEXT};">Sika</div>
                    <div style="font-size:11px;color:${TEXT_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">certifikované</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ PODPIS s medvedíkom ═══ -->
          <tr>
            <td style="padding:8px 32px 36px;text-align:center;">
              <p style="margin:0 0 16px;font-size:16px;color:${TEXT};line-height:1.6;">
                Pekný deň,<br>
                <strong>Tím EPOXIDOVO</strong>
              </p>
              <img src="${bearLogoUrl}" alt="Maskot EPOXIDOVO" width="80" height="80" style="display:block;margin:0 auto;width:80px;height:80px;border:0;outline:none;">
            </td>
          </tr>

        </table>

        <!-- ═══ TMAVÁ PÄTIČKA ═══ -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;margin-top:18px;background:${FOOTER_BG};border-radius:16px;overflow:hidden;">

          <!-- Logo medvedík v päte -->
          <tr>
            <td style="padding:32px 24px 16px;text-align:center;">
              <img src="${bearLogoUrl}" alt="EPOXIDOVO" width="56" height="56" style="display:inline-block;width:56px;height:56px;border:0;outline:none;">
              <div style="margin-top:10px;color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.01em;">
                EPOXIDOVO<span style="color:${BRAND_ORANGE};">·</span>SK
              </div>
            </td>
          </tr>

          <!-- Social ikony -->
          <tr>
            <td style="padding:8px 24px 20px;text-align:center;">
              <a href="${SITE.social.instagram}" style="display:inline-block;margin:0 8px;text-decoration:none;" aria-label="Instagram">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" alt="Instagram" width="22" height="22" style="display:block;width:22px;height:22px;filter:invert(1);border:0;outline:none;opacity:0.85;">
              </a>
              <a href="${SITE.social.tiktok}" style="display:inline-block;margin:0 8px;text-decoration:none;" aria-label="TikTok">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tiktok.svg" alt="TikTok" width="22" height="22" style="display:block;width:22px;height:22px;filter:invert(1);border:0;outline:none;opacity:0.85;">
              </a>
              <a href="${SITE.social.facebook}" style="display:inline-block;margin:0 8px;text-decoration:none;" aria-label="Facebook">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/facebook.svg" alt="Facebook" width="22" height="22" style="display:block;width:22px;height:22px;filter:invert(1);border:0;outline:none;opacity:0.85;">
              </a>
            </td>
          </tr>

          <!-- Kontakty -->
          <tr>
            <td style="padding:0 24px 24px;text-align:center;">
              <div style="color:${FOOTER_TEXT};font-size:13px;line-height:1.7;">
                <strong style="color:#ffffff;">${SITE.legalName}</strong> · IČO ${SITE.business.ico}<br>
                ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}<br>
                <a href="${SITE.url}" style="color:#ffffff;text-decoration:none;font-weight:600;">www.${SITE.domain}</a>
                ·
                <a href="tel:${SITE.contact.phoneRaw}" style="color:#ffffff;text-decoration:none;font-weight:600;">${SITE.contact.phone}</a>
              </div>
            </td>
          </tr>

          <!-- Fine print -->
          <tr>
            <td style="padding:12px 24px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
              <div style="color:rgba(255,255,255,0.45);font-size:10px;line-height:1.6;">
                Tento email si dostal/a, lebo si vyplnil/a formulár na ${SITE.domain}
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function customerDetailRow(label: string, value: string, last = false): string {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:${TEXT_MUTED};width:42%;${last ? "" : `border-bottom:1px solid ${BORDER};`}">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:${TEXT};font-weight:600;text-align:right;${last ? "" : `border-bottom:1px solid ${BORDER};`}">${value}</td>
  </tr>`;
}

// ─────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────

function detailRow(label: string, value: string, last = false): string {
  return `<tr>
    <td style="padding:${last ? "12px 18px" : "12px 18px"};border-bottom:${last ? "none" : `1px solid ${BORDER}80`};font-size:13px;color:${TEXT_MUTED};width:40%;">${label}</td>
    <td style="padding:12px 18px;border-bottom:${last ? "none" : `1px solid ${BORDER}80`};font-size:14px;color:${TEXT};">${value}</td>
  </tr>`;
}

function timelineRow(num: string, title: string, desc: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="42" valign="top" style="padding-right:14px;">
        <div style="width:36px;height:36px;border-radius:50%;background:${BRAND_BLUE};color:#ffffff;font-weight:800;font-size:16px;text-align:center;line-height:36px;">${num}</div>
      </td>
      <td valign="top">
        <div style="font-size:15px;font-weight:700;color:${TEXT};margin-bottom:3px;">${title}</div>
        <div style="font-size:13px;color:${TEXT_MUTED};line-height:1.5;">${desc}</div>
      </td>
    </tr>
  </table>`;
}

function spaceTypeLabel(slug: string): string {
  const map: Record<string, string> = {
    dom: "Dom / interiér",
    garaz: "Garáž / dielňa",
    "hala-firma": "Priemyselná hala / firma",
  };
  return map[slug] ?? slug;
}

function serviceLabel(slug: string): string {
  const map: Record<string, string> = {
    jednofarebne: "Hladké jednofarebné",
    chipsove: "Chipsové",
    mramorove: "Mramorové",
    metalicke: "Metalické",
    priemyselne: "Priemyselné",
    nezvolene: "Nezvolené (chcem poradiť)",
  };
  return map[slug] ?? slug;
}

function sourceLabelFor(slug: string): string {
  const map: Record<string, string> = {
    contact_form: "/kontakt formulár",
    cenova_ponuka_form: "/cenová ponuka formulár",
    kontakt_message_form: "/kontakt — Napíš nám",
    floating_form: "Floating widget",
    sample_picker: "Ukážky podláh modal",
  };
  return map[slug] ?? slug;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
