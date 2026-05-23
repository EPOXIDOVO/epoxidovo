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
    label: "🔴 NOVÝ",
    pill: "bg-red-600 text-white",
  },
  CALLED_NO_ANSWER: {
    label: "🟡 NEDVÍHAL",
    pill: "bg-amber-500 text-white",
  },
  CONTACTED: {
    label: "✅ ZÁUJEM",
    pill: "bg-emerald-600 text-white",
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

function timeAgo(d: Date): string {
  const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (seconds < 60) return "pred chvíľou";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `pred ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `pred ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `pred ${days} d`;
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(d));
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

function describeFailedCallStatus(
  failedCount: number,
  nextCallAt: Date | null,
): string {
  if (failedCount === 0) return "";
  if (failedCount >= 3) {
    return "⚠️ 3× nedvíhal — pôjde follow-up email";
  }
  const next = nextCallAt
    ? `, volať znova ${formatDateTime(nextCallAt)}`
    : "";
  return `nedvíhal ${failedCount}×${next}`;
}

export function LeadCard({ lead }: { lead: Lead }) {
  const [open, setOpen] = React.useState<null | "interested" | "detail">(null);
  const [localLead, setLocalLead] = React.useState<Lead>(lead);
  const [busy, setBusy] = React.useState(false);

  const statusMeta = STATUS_META[localLead.status];
  const sourceLabel =
    SOURCE_LABELS[localLead.source] ?? `📥 ${localLead.source}`;

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
    } catch (e) {
      alert(e instanceof Error ? e.message : "Chyba");
    } finally {
      setBusy(false);
    }
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
                {describeFailedCallStatus(
                  localLead.failedCallCount,
                  localLead.nextCallAt,
                )}
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

        {/* Existing notes */}
        {localLead.notes && (
          <div className="px-5 pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Interná poznámka
            </div>
            <p className="text-sm text-zinc-900 bg-amber-50 border border-amber-200 rounded-lg p-2.5 whitespace-pre-wrap">
              {localLead.notes}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-5 py-4 mt-4 border-t border-zinc-100 bg-zinc-50/60 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setOpen("interested")}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-[0_4px_12px_rgba(5,150,105,0.3)] disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden />
            Zdvihla — záujem
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
            Detail
          </button>
        </div>
      </article>

      {/* Modals */}
      {open === "interested" && (
        <InterestedModal
          lead={localLead}
          onClose={() => setOpen(null)}
          onSave={saveCallResult}
          busy={busy}
        />
      )}
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
// MODAL — "Zdvihla — záujem" (rýchla forma s poznámkou a ďalšou akciou)
// ============================================================================

function InterestedModal({
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
  const [notes, setNotes] = React.useState(lead.notes ?? "");
  const [outcome, setOutcome] = React.useState<"quote" | "callback" | "wait">(
    "quote",
  );
  const [callbackDate, setCallbackDate] = React.useState("");
  const [callbackTime, setCallbackTime] = React.useState("10:00");

  async function handleSave() {
    let status: LeadStatus = "CONTACTED";
    let nextCallAt: string | null = null;
    if (outcome === "quote") {
      status = "QUOTED";
    } else if (outcome === "callback") {
      if (callbackDate && callbackTime) {
        nextCallAt = new Date(`${callbackDate}T${callbackTime}`).toISOString();
      }
      status = "CONTACTED";
    } else {
      status = "CONTACTED";
    }
    await onSave({ status, notes, nextCallAt });
  }

  return (
    <Modal title={`Záznam o hovore — ${lead.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-zinc-50 rounded-lg p-3 text-xs text-zinc-600 space-y-1">
          <div>
            📞 <strong>{lead.phone}</strong> · 📧 {lead.email}
          </div>
          <div>
            {SOURCE_LABELS[lead.source] ?? lead.source} ·{" "}
            {formatDateTime(lead.createdAt)}
          </div>
          {lead.message && (
            <div className="italic text-zinc-700 mt-1.5">„{lead.message}"</div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
            Poznámka z hovoru *
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Čo zákazník povedal: čo chce, kedy, na čo sa pýtal..."
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db6e8]"
            autoFocus
          />
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
            Čo ďalej?
          </div>
          <div className="space-y-2">
            <RadioRow
              checked={outcome === "quote"}
              onChange={() => setOutcome("quote")}
              icon="📤"
              label="Poslať cenovú ponuku"
              hint="Admin pripraví ponuku a pošle"
            />
            <RadioRow
              checked={outcome === "callback"}
              onChange={() => setOutcome("callback")}
              icon="📅"
              label="Zavolať neskôr (naplánovať)"
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
              checked={outcome === "wait"}
              onChange={() => setOutcome("wait")}
              icon="🤔"
              label="Záujem ale ešte sa nerozhodol"
              hint="Sledovať, nepripravovať ponuku zatiaľ"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || !notes.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm disabled:opacity-50"
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
// MODAL — "Detail" (full možnosti)
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
