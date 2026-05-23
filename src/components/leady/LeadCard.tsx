"use client";

import * as React from "react";
import {
  Phone,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle2,
  PhoneOff,
  MoreHorizontal,
  X,
  Save,
  Calendar,
} from "lucide-react";
import type { Lead, LeadStatus } from "@prisma/client";

const STATUS_META: Record<
  LeadStatus,
  { label: string; pill: string }
> = {
  NEW: {
    label: "🟢 NOVÝ",
    pill: "bg-emerald-600 text-white",
  },
  CALLED_NO_ANSWER: {
    label: "🟡 NEDVÍHAL",
    pill: "bg-amber-500 text-white",
  },
  CONTACTED: {
    label: "✅ ZÁUJEM",
    pill: "bg-blue-600 text-white",
  },
  QUOTED: {
    label: "📋 PONUKA",
    pill: "bg-violet-600 text-white",
  },
  WON: {
    label: "🏆 VYHRANÝ",
    pill: "bg-green-700 text-white",
  },
  REALIZED: {
    label: "🏠 HOTOVÁ",
    pill: "bg-teal-700 text-white",
  },
  NOT_INTERESTED: {
    label: "❌ NEZÁUJEM",
    pill: "bg-zinc-500 text-white",
  },
  LOST: {
    label: "💔 STRATENÝ",
    pill: "bg-red-700 text-white",
  },
};

/**
 * 4 dummy status opcie pre rýchly dropdown na karte.
 * Užívateľ ich finalizuje neskôr — zatiaľ použijeme tie najtypickejšie
 * výsledky hovoru.
 */
const QUICK_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "CONTACTED", label: "✅ Zdvihla — záujem" },
  { value: "QUOTED", label: "📋 Ponuka odoslaná" },
  { value: "NOT_INTERESTED", label: "❌ Nezáujem" },
  { value: "LOST", label: "💔 Stratený / nesprávne číslo" },
];

const SOURCE_LABELS: Record<string, string> = {
  web: "🌐 Web",
  cenova_ponuka_form: "🌐 Web (ponuka)",
  kontakt_message_form: "🌐 Web (kontakt)",
  contact_form: "🌐 Web",
  meta: "📘 FB / IG Ads",
  google: "🔍 Google Ads",
  callback: "📲 Callback",
  sample_picker: "🎨 Sample picker",
};

/**
 * Slovenský "pred X" formát presný na minútu:
 *   "práve teraz"
 *   "pred 1 minútou" / "pred 23 minútami"
 *   "pred 1 hodinou" / "pred 2 hodinami a 15 minútami"
 *   "pred 1 dňom" / "pred 3 dňami a 4 hodinami"
 *   pre staršie ako 30 dní vráti dátum.
 */
function timeAgo(d: Date | string): string {
  const totalSeconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (totalSeconds < 60) return "práve teraz";

  const totalMinutes = Math.floor(totalSeconds / 60);

  // < 1 hodina — len minúty
  if (totalMinutes < 60) {
    return totalMinutes === 1
      ? "pred 1 minútou"
      : `pred ${totalMinutes} minútami`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const remainMin = totalMinutes % 60;

  // < 24 hodín — hodiny [+ minúty]
  if (totalHours < 24) {
    const h = totalHours === 1 ? "1 hodinou" : `${totalHours} hodinami`;
    if (remainMin === 0) return `pred ${h}`;
    const m = remainMin === 1 ? "1 minútou" : `${remainMin} minútami`;
    return `pred ${h} a ${m}`;
  }

  const totalDays = Math.floor(totalHours / 24);
  const remainHrs = totalHours % 24;

  // < 30 dní — dni [+ hodiny]
  if (totalDays < 30) {
    const dStr = totalDays === 1 ? "1 dňom" : `${totalDays} dňami`;
    if (remainHrs === 0) return `pred ${dStr}`;
    const hStr = remainHrs === 1 ? "1 hodinou" : `${remainHrs} hodinami`;
    return `pred ${dStr} a ${hStr}`;
  }

  // staršie ako mesiac — dátum
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(d));
}

/**
 * Slovenský "o X" countdown presný na minútu.
 * Vráti { text, isDue, totalMinutes } — isDue = true ak čas uplynul.
 */
function timeUntil(
  d: Date | string,
): { text: string; isDue: boolean; totalMinutes: number } {
  const totalSeconds = Math.floor(
    (new Date(d).getTime() - Date.now()) / 1000,
  );
  if (totalSeconds <= 0) {
    return { text: "TERAZ", isDue: true, totalMinutes: 0 };
  }
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 1) {
    return { text: "o chvíľu", isDue: false, totalMinutes: 0 };
  }
  if (totalMinutes < 60) {
    const text =
      totalMinutes === 1 ? "o 1 minútu" : `o ${totalMinutes} minút`;
    return { text, isDue: false, totalMinutes };
  }
  const totalHours = Math.floor(totalMinutes / 60);
  const remainMin = totalMinutes % 60;
  if (totalHours < 24) {
    const h = totalHours === 1 ? "1 hodinu" : `${totalHours} hodín`;
    if (remainMin === 0)
      return { text: `o ${h}`, isDue: false, totalMinutes };
    const m = remainMin === 1 ? "1 minútu" : `${remainMin} minút`;
    return { text: `o ${h} a ${m}`, isDue: false, totalMinutes };
  }
  const totalDays = Math.floor(totalHours / 24);
  const remainHrs = totalHours % 24;
  const d2 = totalDays === 1 ? "1 deň" : `${totalDays} dní`;
  if (remainHrs === 0)
    return { text: `o ${d2}`, isDue: false, totalMinutes };
  const h = remainHrs === 1 ? "1 hodinu" : `${remainHrs} hodín`;
  return { text: `o ${d2} a ${h}`, isDue: false, totalMinutes };
}

function formatDateTime(d: Date | string | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

/**
 * Hook ktorý core-component re-renderuje každú minútu — aby sa countdowny
 * automaticky updatovali bez F5.
 */
function useLiveClock(intervalMs = 30_000): void {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
}

export function LeadCard({ lead }: { lead: Lead }) {
  useLiveClock();
  const [open, setOpen] = React.useState<null | "detail">(null);
  const [localLead, setLocalLead] = React.useState<Lead>(lead);
  const [busy, setBusy] = React.useState(false);

  // Editable local state — status dropdown a poznámka
  const [pendingStatus, setPendingStatus] = React.useState<LeadStatus>(
    localLead.status,
  );
  const [pendingNotes, setPendingNotes] = React.useState<string>(
    localLead.notes ?? "",
  );
  const [savedHint, setSavedHint] = React.useState(false);

  React.useEffect(() => {
    setPendingStatus(localLead.status);
    setPendingNotes(localLead.notes ?? "");
  }, [localLead.status, localLead.notes]);

  const statusMeta = STATUS_META[localLead.status];
  const sourceLabel =
    SOURCE_LABELS[localLead.source] ?? `📥 ${localLead.source}`;

  const dirty =
    pendingStatus !== localLead.status ||
    pendingNotes !== (localLead.notes ?? "");

  async function quickMissedCall() {
    setBusy(true);
    try {
      const res = await fetch(`/api/lead/${localLead.id}/missed-call`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Chyba pri ukladaní");
      const { lead: updated } = await res.json();
      setLocalLead(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Chyba");
    } finally {
      setBusy(false);
    }
  }

  async function saveCallResult(payload: {
    status: LeadStatus;
    notes?: string;
    nextCallAt?: string | null;
  }) {
    setBusy(true);
    try {
      const res = await fetch(`/api/lead/${localLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Chyba pri ukladaní");
      const { lead: updated } = await res.json();
      setLocalLead(updated);
      setOpen(null);
      setSavedHint(true);
      setTimeout(() => setSavedHint(false), 2000);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Chyba");
    } finally {
      setBusy(false);
    }
  }

  async function saveInline() {
    await saveCallResult({ status: pendingStatus, notes: pendingNotes });
  }

  // Build "info line" — najdôležitejšie údaje vedľa seba
  const infoBits = [
    localLead.area ? `${localLead.area} m²` : null,
    localLead.spaceType
      ? localLead.spaceType === "dom"
        ? "Dom"
        : localLead.spaceType === "garaz"
          ? "Garáž"
          : localLead.spaceType === "hala-firma"
            ? "Priemysel"
            : localLead.spaceType
      : null,
    localLead.service
      ? localLead.service === "jednofarebne"
        ? "Jednofarebná"
        : localLead.service === "chipsove"
          ? "Chipsová"
          : localLead.service === "mramorove"
            ? "Mramorová"
            : localLead.service === "metalicke"
              ? "Metalická"
              : localLead.service
      : null,
  ].filter(Boolean);

  return (
    <>
      <article className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Status pill + source/time */}
        <div className="px-5 pt-4 flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusMeta.pill}`}
            >
              {statusMeta.label}
            </span>
            {localLead.failedCallCount > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                  localLead.failedCallCount >= 3
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                <AlertCircle className="w-3 h-3" aria-hidden />
                {localLead.failedCallCount >= 3
                  ? "⚠️ 3× nedvíhal — pôjde follow-up email"
                  : `nedvíhal ${localLead.failedCallCount}×`}
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500 inline-flex items-center gap-2">
            <span className="font-semibold">{sourceLabel}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden />
              {timeAgo(localLead.createdAt)}
            </span>
          </div>
        </div>

        {/* Name */}
        <div className="px-5 pt-3">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            {localLead.name}
          </h2>
        </div>

        {/* BIG phone (the hero element) + email */}
        <div className="px-5 pt-2.5 space-y-1.5">
          {localLead.phone ? (
            <a
              href={`tel:${localLead.phone}`}
              className="inline-flex items-center gap-2 text-2xl md:text-3xl font-extrabold text-emerald-700 hover:text-emerald-900 tracking-tight"
            >
              <Phone className="w-6 h-6 md:w-7 md:h-7" aria-hidden />
              {localLead.phone}
            </a>
          ) : (
            <div className="text-sm text-zinc-500 italic">
              Telefón nezadaný — kontaktuj cez email
            </div>
          )}
          <a
            href={`mailto:${localLead.email}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <Mail className="w-4 h-4" aria-hidden />
            {localLead.email}
          </a>
        </div>

        {/* Info bits — m² · type · service */}
        {infoBits.length > 0 && (
          <div className="px-5 pt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {infoBits.map((bit, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-sm font-semibold"
              >
                {bit}
              </span>
            ))}
          </div>
        )}

        {/* Message excerpt */}
        {localLead.message && (
          <div className="px-5 pt-3">
            <p className="text-sm text-zinc-700 leading-snug line-clamp-2 italic">
              „{localLead.message}"
            </p>
          </div>
        )}

        {/* Call timeline — kedy bolo naposledy volané + countdown k ďalšiemu pokusu */}
        {(localLead.lastCallAt || localLead.nextCallAt) && (
          <div className="px-5 pt-3 space-y-1.5">
            {localLead.lastCallAt && (
              <div className="text-xs text-zinc-600 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                <span>
                  Naposledy volané:{" "}
                  <strong>{formatDateTime(localLead.lastCallAt)}</strong>{" "}
                  <span className="text-zinc-500">
                    ({timeAgo(localLead.lastCallAt)})
                  </span>
                </span>
              </div>
            )}
            {localLead.nextCallAt &&
              (() => {
                const { text, isDue } = timeUntil(localLead.nextCallAt);
                return isDue ? (
                  <div className="text-sm inline-flex items-center gap-2 font-bold px-3 py-2 rounded-lg bg-red-50 border border-red-300 text-red-800 animate-pulse">
                    <Phone className="w-4 h-4" aria-hidden />
                    📞 MÔŽEŠ TERAZ VOLAŤ
                    <span className="text-xs font-medium opacity-80">
                      (naplánovaný čas{" "}
                      {formatDateTime(localLead.nextCallAt)} už uplynul)
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-blue-700 inline-flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5" aria-hidden />
                    <span>
                      Ďalší pokus:{" "}
                      <strong>{formatDateTime(localLead.nextCallAt)}</strong>{" "}
                      <span className="text-blue-600">({text})</span>
                    </span>
                  </div>
                );
              })()}
          </div>
        )}

        {/* Editor — status dropdown + notes textarea */}
        <div className="px-5 pt-4 pb-3 mt-3 border-t border-zinc-100 bg-zinc-50/60 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Zmeniť status
              </label>
              <select
                value={pendingStatus}
                onChange={(e) =>
                  setPendingStatus(e.target.value as LeadStatus)
                }
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3db6e8]"
              >
                <option value={localLead.status}>
                  ↳ {STATUS_META[localLead.status].label} (aktuálny)
                </option>
                {QUICK_STATUS_OPTIONS.filter(
                  (o) => o.value !== localLead.status,
                ).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Interná poznámka
              </label>
              <textarea
                value={pendingNotes}
                onChange={(e) => setPendingNotes(e.target.value)}
                rows={2}
                placeholder="napr. 'chce ponuku do piatka, volať po 17h'"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3db6e8] resize-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled={busy || !dirty}
              onClick={saveInline}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-[0_4px_12px_rgba(5,150,105,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savedHint ? (
                <>
                  <CheckCircle2 className="w-4 h-4" aria-hidden />
                  Uložené ✓
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" aria-hidden />
                  {busy ? "Ukladám…" : "Uložiť zmeny"}
                </>
              )}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={quickMissedCall}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm shadow-[0_4px_12px_rgba(245,158,11,0.3)] disabled:opacity-50"
            >
              <PhoneOff className="w-4 h-4" aria-hidden />
              Nedvíha
              {localLead.failedCallCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-white/25 text-[10px] font-bold">
                  {localLead.failedCallCount}×
                </span>
              )}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setOpen("detail")}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-zinc-50 active:bg-zinc-100 text-zinc-800 font-bold text-sm border border-zinc-300 disabled:opacity-50"
            >
              <MoreHorizontal className="w-4 h-4" aria-hidden />
              Viac možností
            </button>
          </div>
        </div>
      </article>

      {/* Modal — len pre "Viac možností" (advanced) */}
      {open === "detail" && (
        <DetailModal
          lead={localLead}
          onClose={() => setOpen(null)}
          onSave={saveCallResult}
          busy={busy}
        />
      )}
    </>
  );
}

// ============================================================================
// MODAL — "Viac možností" (advanced status + callback scheduling)
// ============================================================================

function DetailModal({
  lead,
  onClose,
  onSave,
  busy,
}: {
  lead: Lead;
  onClose: () => void;
  onSave: (payload: {
    status: LeadStatus;
    notes?: string;
    nextCallAt?: string | null;
  }) => Promise<void>;
  busy: boolean;
}) {
  const [outcome, setOutcome] = React.useState<
    "interested" | "callback" | "not_interested" | "wrong_number" | "lost" | "won" | "realized"
  >("interested");
  const [notes, setNotes] = React.useState(lead.notes ?? "");
  const [callbackDate, setCallbackDate] = React.useState("");
  const [callbackTime, setCallbackTime] = React.useState("10:00");

  async function handleSave() {
    let status: LeadStatus = "CONTACTED";
    let nextCallAt: string | null = null;
    switch (outcome) {
      case "interested":
        status = "CONTACTED";
        break;
      case "callback":
        status = "CONTACTED";
        if (callbackDate && callbackTime) {
          nextCallAt = new Date(`${callbackDate}T${callbackTime}`).toISOString();
        }
        break;
      case "not_interested":
        status = "NOT_INTERESTED";
        break;
      case "wrong_number":
        status = "LOST";
        break;
      case "lost":
        status = "LOST";
        break;
      case "won":
        status = "WON";
        break;
      case "realized":
        status = "REALIZED";
        break;
    }
    await onSave({ status, notes, nextCallAt });
  }

  return (
    <Modal title={`Detail leadu — ${lead.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-zinc-50 rounded-lg p-3 text-xs text-zinc-600 space-y-1">
          <div>
            📞 <strong>{lead.phone || "(žiadny telefón)"}</strong> · 📧{" "}
            {lead.email}
          </div>
          <div>
            {SOURCE_LABELS[lead.source] ?? lead.source} ·{" "}
            {formatDateTime(lead.createdAt)}
          </div>
          {lead.area && <div>Plocha: {lead.area} m²</div>}
          {lead.spaceType && <div>Priestor: {lead.spaceType}</div>}
          {lead.service && <div>Záujem: {lead.service}</div>}
          {lead.message && (
            <div className="italic text-zinc-700 mt-1.5">„{lead.message}"</div>
          )}
          {lead.failedCallCount > 0 && (
            <div className="mt-2 text-amber-700 font-semibold">
              Nedvíhal už {lead.failedCallCount}×
              {lead.nextCallAt &&
                ` · ďalší pokus naplánovaný ${formatDateTime(lead.nextCallAt)}`}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
            Výsledok hovoru
          </div>
          <div className="space-y-1.5">
            <RadioRow
              checked={outcome === "interested"}
              onChange={() => setOutcome("interested")}
              icon="✅"
              label="Zdvihla — záujem"
            />
            <RadioRow
              checked={outcome === "callback"}
              onChange={() => setOutcome("callback")}
              icon="📅"
              label="Zdvihla — chce volať neskôr"
            />
            {outcome === "callback" && (
              <div className="ml-7 grid grid-cols-2 gap-2 mt-1">
                <input
                  type="date"
                  value={callbackDate}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="px-3 py-2 rounded-lg border border-zinc-300 text-sm"
                />
                <input
                  type="time"
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-zinc-300 text-sm"
                />
              </div>
            )}
            <RadioRow
              checked={outcome === "not_interested"}
              onChange={() => setOutcome("not_interested")}
              icon="❌"
              label="Zdvihla — nemá záujem"
            />
            <RadioRow
              checked={outcome === "wrong_number"}
              onChange={() => setOutcome("wrong_number")}
              icon="🚫"
              label="Nesprávne číslo / neexistuje"
            />
            <RadioRow
              checked={outcome === "won"}
              onChange={() => setOutcome("won")}
              icon="🏆"
              label="Podpísaná zmluva"
            />
            <RadioRow
              checked={outcome === "realized"}
              onChange={() => setOutcome("realized")}
              icon="🏠"
              label="Hotová realizácia"
            />
            <RadioRow
              checked={outcome === "lost"}
              onChange={() => setOutcome("lost")}
              icon="💔"
              label="Stratený"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
            Poznámka
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Doplnené info, dôvod, dohovorené detaily..."
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db6e8]"
          />
        </div>

        <div className="flex gap-2 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" aria-hidden />
            {busy ? "Ukladám…" : "Uložiť"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-sm"
          >
            Zrušiť
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// Pomocné komponenty
// ============================================================================

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100"
            aria-label="Zavrieť"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </header>
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function RadioRow({
  checked,
  onChange,
  icon,
  label,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  icon: string;
  label: string;
  hint?: string;
}) {
  return (
    <label
      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
        checked
          ? "border-[#3db6e8] bg-[#3db6e8]/5 ring-2 ring-[#3db6e8]/20"
          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 accent-[#3db6e8]"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">
          {icon} {label}
        </div>
        {hint && <div className="text-xs text-zinc-500 mt-0.5">{hint}</div>}
      </div>
    </label>
  );
}
