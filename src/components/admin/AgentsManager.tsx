"use client";

import * as React from "react";
import { UserPlus, Trash2, Power, Mail, ShieldCheck, User as UserIcon } from "lucide-react";

interface AgentUser {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "AGENT" | "VIEWER";
  active: boolean;
  createdAt: Date | string;
  emailVerified: Date | string | null;
}

export function AgentsManager({ initialUsers }: { initialUsers: AgentUser[] }) {
  const [users, setUsers] = React.useState(initialUsers);
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<"AGENT" | "ADMIN">("AGENT");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function addAgent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          role,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Neznáma chyba");
      }
      const { user } = await res.json();
      setUsers((u) => [user, ...u]);
      setEmail("");
      setName("");
      setRole("AGENT");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) {
      setUsers((u) =>
        u.map((x) => (x.id === id ? { ...x, active: !active } : x)),
      );
    }
  }

  async function remove(id: string) {
    if (!confirm("Zmazať tohto používateľa? Tým príde o prístup.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="text-base font-bold tracking-tight mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#3db6e8]" aria-hidden />
          Pridať nového používateľa
        </h2>
        <form onSubmit={addAgent} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="peter@epoxidovo.sk"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#3db6e8] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Meno (voliteľné)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Peter Kováč"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#3db6e8] text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Rola
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "AGENT" | "ADMIN")}
              className="px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#3db6e8] text-sm"
            >
              <option value="AGENT">
                AGENT — prístup iba do /leady (call agent)
              </option>
              <option value="ADMIN">
                ADMIN — plný prístup (/admin aj /leady)
              </option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !email}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3db6e8] text-white text-sm font-semibold hover:bg-[#1a8cc4] disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" aria-hidden />
            {submitting ? "Pridávam…" : "Pridať používateľa"}
          </button>
          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}
        </form>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-600">
                Používateľ
              </th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-600">
                Rola
              </th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-600">
                Stav
              </th>
              <th className="text-right px-5 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-600">
                Akcie
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-zinc-500">
                  Žiadni používatelia. Pridaj prvého.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" aria-hidden />
                    <div>
                      <div className="font-semibold">{u.email}</div>
                      {u.name && (
                        <div className="text-xs text-zinc-500">{u.name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={
                      u.role === "ADMIN"
                        ? "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-900 text-white"
                        : u.role === "AGENT"
                          ? "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#3db6e8]/10 text-[#1a8cc4]"
                          : "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-100 text-zinc-700"
                    }
                  >
                    {u.role === "ADMIN" ? (
                      <ShieldCheck className="w-3 h-3" aria-hidden />
                    ) : (
                      <UserIcon className="w-3 h-3" aria-hidden />
                    )}
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.active ? (
                    <span className="text-xs font-semibold text-emerald-700">
                      ● Aktívny
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">
                      ○ Deaktivovaný
                    </span>
                  )}
                  {!u.emailVerified && (
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      ešte sa neprihlásil
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(u.id, u.active)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-100"
                    title={u.active ? "Deaktivovať" : "Aktivovať"}
                  >
                    <Power className="w-3.5 h-3.5" aria-hidden />
                    {u.active ? "Deaktivovať" : "Aktivovať"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(u.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden />
                    Zmazať
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
