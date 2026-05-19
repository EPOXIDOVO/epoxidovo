"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { LeadStatus } from "@prisma/client";
import { CheckCircle2, Loader2 } from "lucide-react";
import { STATUS_LABELS } from "@/lib/leads";

interface Props {
  leadId: string;
  currentStatus: LeadStatus;
}

export function LeadStatusForm({ leadId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = React.useState<LeadStatus>(currentStatus);
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSavedAt(Date.now());
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const dirty = status !== currentStatus;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl p-5 md:p-6 border border-[var(--color-border)] shadow-[var(--shadow-card)]"
    >
      <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] mb-4">
        Zmeniť stav
      </h2>

      <div className="space-y-2">
        {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
          <label
            key={s}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-colors ${
              status === s
                ? "border-[#3db6e8] bg-blue-50"
                : "border-transparent hover:bg-[var(--color-bg-soft)]"
            }`}
          >
            <input
              type="radio"
              name="status"
              value={s}
              checked={status === s}
              onChange={() => setStatus(s)}
              className="w-4 h-4 text-[#3db6e8] focus:ring-2 focus:ring-[#3db6e8]"
            />
            <span className="text-sm font-medium">{STATUS_LABELS[s]}</span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={!dirty || saving}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Ukladám…
          </>
        ) : savedAt ? (
          <>
            <CheckCircle2 className="w-4 h-4" aria-hidden />
            Uložené
          </>
        ) : (
          "Uložiť"
        )}
      </button>
    </form>
  );
}
