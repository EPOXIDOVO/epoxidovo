"use client";

import * as React from "react";
import { Plus, CheckCircle2, AlertCircle, Trash2, X, Receipt } from "lucide-react";
import type { InvoiceStatus } from "@prisma/client";

interface InvoiceRow {
  id: string;
  number: string | null;
  customerName: string;
  customerEmail: string | null;
  amount: number;
  currency: string;
  description: string | null;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  notes: string | null;
  leadId: string | null;
  lead: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface LeadOption {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

const STATUS_META: Record<
  InvoiceStatus,
  { label: string; pill: string }
> = {
  UNPAID: { label: "⏳ Neuhradená", pill: "bg-amber-100 text-amber-800" },
  PAID: { label: "✅ Uhradená", pill: "bg-emerald-100 text-emerald-800" },
  OVERDUE: { label: "🚨 Po splatnosti", pill: "bg-red-100 text-red-800" },
  CANCELLED: { label: "🗑 Stornovaná", pill: "bg-zinc-100 text-zinc-600" },
};

function formatMoney(amount: number, currency: string = "EUR"): string {
  return amount.toLocaleString("sk-SK", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

export function InvoicesManager({
  initialInvoices,
  leads,
}: {
  initialInvoices: InvoiceRow[];
  leads: LeadOption[];
}) {
  const [invoices, setInvoices] = React.useState(initialInvoices);
  const [showForm, setShowForm] = React.useState(false);
  const [filter, setFilter] = React.useState<InvoiceStatus | "ALL">("ALL");

  const filtered = invoices.filter((i) =>
    filter === "ALL" ? true : i.status === filter,
  );

  async function addInvoice(payload: {
    customerName: string;
    customerEmail?: string;
    amount: number;
    number?: string;
    description?: string;
    leadId?: string | null;
    dueAt?: string | null;
  }) {
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || "Chyba pri ukladaní");
    }
    const { invoice } = await res.json();
    setInvoices((prev) => [invoice, ...prev]);
    setShowForm(false);
  }

  async function markPaid(id: string) {
    const res = await fetch(`/api/admin/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "PAID",
        paidAt: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      const { invoice } = await res.json();
      setInvoices((prev) => prev.map((i) => (i.id === id ? invoice : i)));
    }
  }

  async function markUnpaid(id: string) {
    const res = await fetch(`/api/admin/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "UNPAID", paidAt: null }),
    });
    if (res.ok) {
      const { invoice } = await res.json();
      setInvoices((prev) => prev.map((i) => (i.id === id ? invoice : i)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Zmazať túto faktúru?")) return;
    const res = await fetch(`/api/admin/invoices/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter + add */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["ALL", "UNPAID", "PAID", "OVERDUE", "CANCELLED"] as const).map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={
                  filter === s
                    ? "px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold"
                    : "px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold hover:border-zinc-400"
                }
              >
                {s === "ALL"
                  ? "Všetky"
                  : STATUS_META[s as InvoiceStatus].label}
                <span className="ml-1.5 opacity-60">
                  (
                  {s === "ALL"
                    ? invoices.length
                    : invoices.filter((i) => i.status === s).length}
                  )
                </span>
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3db6e8] hover:bg-[#1a8cc4] text-white text-sm font-bold"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Nová faktúra
        </button>
      </div>

      {/* Invoices table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-zinc-600">
                Číslo / Zákazník
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-zinc-600">
                Suma
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-zinc-600">
                Vystavená
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-zinc-600">
                Splatnosť
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-zinc-600">
                Stav
              </th>
              <th className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-zinc-600">
                Akcie
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  <Receipt className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                  Žiadne faktúry v tomto filtri.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold">
                      {inv.number ? `#${inv.number} · ` : ""}
                      {inv.customerName}
                    </div>
                    {inv.lead && (
                      <div className="text-xs text-zinc-500 mt-0.5">
                        prepojené s lead: {inv.lead.name} ({inv.lead.email})
                      </div>
                    )}
                    {inv.description && (
                      <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                        {inv.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-base">
                    {formatMoney(inv.amount, inv.currency)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatDate(inv.issuedAt)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatDate(inv.dueAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-full ${STATUS_META[inv.status].pill}`}
                    >
                      {STATUS_META[inv.status].label}
                    </span>
                    {inv.paidAt && inv.status === "PAID" && (
                      <div className="text-[10px] text-emerald-700 mt-0.5">
                        zaplatené {formatDate(inv.paidAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-col gap-1 items-end">
                      {inv.status !== "PAID" ? (
                        <button
                          type="button"
                          onClick={() => markPaid(inv.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
                          Označiť uhradenú
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markUnpaid(inv.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 px-2 py-1 rounded hover:bg-amber-50"
                        >
                          <AlertCircle className="w-3.5 h-3.5" aria-hidden />
                          Naspäť na neuhradenú
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(inv.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden />
                        Zmazať
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <InvoiceForm
          leads={leads}
          onClose={() => setShowForm(false)}
          onSave={addInvoice}
        />
      )}
    </div>
  );
}

// ============================================================================
// Modal — pridať novú faktúru
// ============================================================================

function InvoiceForm({
  leads,
  onClose,
  onSave,
}: {
  leads: LeadOption[];
  onClose: () => void;
  onSave: (payload: {
    customerName: string;
    customerEmail?: string;
    amount: number;
    number?: string;
    description?: string;
    leadId?: string | null;
    dueAt?: string | null;
  }) => Promise<void>;
}) {
  const [leadId, setLeadId] = React.useState<string>("");
  const [number, setNumber] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Auto-fill keď sa vyberie lead
  React.useEffect(() => {
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setCustomerName(lead.name);
      setCustomerEmail(lead.email);
    }
  }, [leadId, leads]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount.replace(",", "."));
    if (!customerName || !amt || amt <= 0) {
      setError("Meno zákazníka a kladná suma sú povinné");
      return;
    }
    setBusy(true);
    try {
      await onSave({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        amount: amt,
        number: number.trim() || undefined,
        description: description.trim() || undefined,
        leadId: leadId || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">Nová faktúra</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100"
            aria-label="Zavrieť"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </header>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Prepojiť s leadom (voliteľné)
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm"
            >
              <option value="">— bez prepojenia —</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.email}
                  {l.phone ? ` · ${l.phone}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Keď vyberieš leada, automaticky vyplní meno + email zákazníka.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                Číslo faktúry (voliteľné)
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="2026-001"
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                Splatnosť do
              </label>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Meno zákazníka *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Jozef Mrkvička"
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Email zákazníka
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="jozef@example.sk"
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Suma (EUR) *
            </label>
            <input
              type="text"
              required
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1250.00"
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Popis / poznámka
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="napr. 'Záloha 50%' alebo 'Realizácia podlahy 35 m²'"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-2 pt-3 border-t border-zinc-100">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#3db6e8] hover:bg-[#1a8cc4] text-white font-bold text-sm disabled:opacity-50"
            >
              {busy ? "Ukladám…" : "Vytvoriť faktúru"}
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
        </form>
      </div>
    </div>
  );
}
