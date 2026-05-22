"use client";

import * as React from "react";
import { Phone, Mail, MapPin, Calendar, Save, Check } from "lucide-react";
import type { Lead, LeadStatus } from "@prisma/client";

const STATUS_LABELS: Record<LeadStatus, { label: string; color: string }> = {
  NEW: { label: "🆕 Nový", color: "bg-blue-100 text-blue-800" },
  CALLED_NO_ANSWER: {
    label: "📞 Nedovolal som sa",
    color: "bg-amber-100 text-amber-800",
  },
  CONTACTED: { label: "✅ Záujem", color: "bg-emerald-100 text-emerald-800" },
  QUOTED: { label: "📋 Ponuka odoslaná", color: "bg-violet-100 text-violet-800" },
  WON: { label: "🏆 Vyhraný", color: "bg-green-100 text-green-800" },
  REALIZED: { label: "🏠 Hotová realizácia", color: "bg-teal-100 text-teal-800" },
  NOT_INTERESTED: { label: "❌ Nezáujem", color: "bg-zinc-200 text-zinc-700" },
  LOST: { label: "💔 Stratený", color: "bg-red-100 text-red-800" },
};

const SOURCE_LABELS: Record<string, string> = {
  web: "🌐 Web",
  cenova_ponuka_form: "🌐 Web (ponuka)",
  kontakt_message_form: "🌐 Web (kontakt)",
  contact_form: "🌐 Web",
  meta: "📘 Meta",
  google: "🔵 Google",
  callback: "📲 Callback",
  sample_picker: "🎨 Sample picker",
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function LeadTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
        <p className="text-zinc-500">
          Žiadne leady pre tento filter. Skús "Všetky" alebo počkaj na nový
          dopyt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const [status, setStatus] = React.useState<LeadStatus>(lead.status);
  const [notes, setNotes] = React.useState(lead.notes ?? "");
  const [failedCallCount, setFailedCallCount] = React.useState(
    lead.failedCallCount,
  );
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty =
    status !== lead.status ||
    (notes || "") !== (lead.notes ?? "") ||
    failedCallCount !== lead.failedCallCount;

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/lead/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes, failedCallCount }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Neznáma chyba");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba");
    } finally {
      setSaving(false);
    }
  }

  function markFailedCall() {
    setFailedCallCount((c) => c + 1);
    if (status === "NEW") setStatus("CALLED_NO_ANSWER");
  }

  const statusMeta = STATUS_LABELS[status];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-zinc-300 transition-colors">
      {/* Header — meno + zdroj + status */}
      <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold tracking-tight">{lead.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
              {SOURCE_LABELS[lead.source] ?? lead.source}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusMeta.color}`}
            >
              {statusMeta.label}
            </span>
            {failedCallCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                ☎ {failedCallCount}× nedov.
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-zinc-500 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden />
              {formatDate(lead.createdAt)}
            </span>
            {lead.spaceType && (
              <span className="capitalize">📐 {lead.spaceType}</span>
            )}
            {lead.area && <span>{lead.area} m²</span>}
            {lead.service && <span>🎨 {lead.service}</span>}
          </div>
        </div>
      </div>

      {/* Kontakt + správa */}
      <div className="px-5 pb-3 space-y-2">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              <Phone className="w-4 h-4" aria-hidden />
              {lead.phone}
            </a>
          )}
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-zinc-900"
          >
            <Mail className="w-4 h-4" aria-hidden />
            {lead.email}
          </a>
          {(lead.utmSource || lead.utmCampaign) && (
            <span className="inline-flex items-center gap-1.5 text-zinc-500 text-xs">
              <MapPin className="w-3 h-3" aria-hidden />
              {lead.utmSource}
              {lead.utmCampaign ? ` / ${lead.utmCampaign}` : ""}
            </span>
          )}
        </div>
        {lead.message && (
          <div className="text-sm text-zinc-700 bg-zinc-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
            {lead.message}
          </div>
        )}
      </div>

      {/* Status + poznámky editor */}
      <div className="border-t border-zinc-100 px-5 py-3 bg-zinc-50/50">
        <div className="grid md:grid-cols-2 gap-3 items-start">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3db6e8]"
            >
              {Object.entries(STATUS_LABELS).map(([v, meta]) => (
                <option key={v} value={v}>
                  {meta.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={markFailedCall}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-50 px-2 py-1 rounded"
            >
              + 1× nedovolal som sa
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Interná poznámka
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Napr. 'chce ponuku do piatka', 'vola po 17h'..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3db6e8] resize-none"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={save}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" aria-hidden />
                Uložené
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden />
                {saving ? "Ukladám…" : "Uložiť zmeny"}
              </>
            )}
          </button>
          {error && (
            <span className="text-xs text-red-600 font-medium">{error}</span>
          )}
        </div>
      </div>
    </div>
  );
}
