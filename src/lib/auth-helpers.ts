/**
 * Centrálny auth helper pre API routes.
 *
 * Použitie:
 *   const check = await requireRole("ADMIN");
 *   if (check.error) return check.error;
 *   // ... pokračuj
 *
 * Alebo viac rolí naraz:
 *   const check = await requireRole(["ADMIN", "AGENT"]);
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type Role = "ADMIN" | "AGENT" | "VIEWER";

interface AuthSession {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: Role;
  };
}

interface CheckOk {
  error: null;
  session: AuthSession;
}
interface CheckFail {
  error: NextResponse;
  session: null;
}

/**
 * Vráti chybu (401/403) alebo session ak user má požadovanú rolu.
 *
 * Striktný: rola sa musí presne zhodovať s ktorou z `allowed`.
 * Neautentifikovaný user → 401. Autentifikovaný ale wrong role → 403.
 */
export async function requireRole(
  allowed: Role | readonly Role[],
): Promise<CheckOk | CheckFail> {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  const role = (session.user as { role?: Role }).role;
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!role || !allowedList.includes(role)) {
    return {
      error: NextResponse.json({ error: "forbidden" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session: session as AuthSession };
}

/** Skratka pre ADMIN-only endpoints. */
export const requireAdmin = () => requireRole("ADMIN");

/** Skratka pre endpoints kde môžu pracovať ADMIN + AGENT (call agenti). */
export const requireAdminOrAgent = () =>
  requireRole(["ADMIN", "AGENT"] as const);
