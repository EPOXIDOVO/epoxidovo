/**
 * Helpers pre admin lead operations.
 * Robust voči DB unavailability — ak DATABASE_URL je placeholder, vracia mock/empty.
 */

import type { Lead, LeadStatus } from "@prisma/client";

export interface LeadStats {
  total: number;
  newThisWeek: number;
  contacted: number;
  won: number;
  lost: number;
  conversionRate: number; // %
}

export function isDbAvailable(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("placeholder"));
}

export async function getLeadStats(): Promise<LeadStats | null> {
  if (!isDbAvailable()) return null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, newThisWeek, contacted, won, lost] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.lead.count({ where: { status: "CONTACTED" } }),
      prisma.lead.count({ where: { status: "WON" } }),
      prisma.lead.count({ where: { status: "LOST" } }),
    ]);

    const closed = won + lost;
    const conversionRate = closed > 0 ? Math.round((won / closed) * 100) : 0;

    return { total, newThisWeek, contacted, won, lost, conversionRate };
  } catch {
    return null;
  }
}

export interface LeadsListFilter {
  status?: LeadStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getLeads(filter: LeadsListFilter = {}): Promise<{
  leads: Lead[];
  totalCount: number;
}> {
  if (!isDbAvailable()) return { leads: [], totalCount: 0 };
  try {
    const { prisma } = await import("@/lib/prisma");
    const where: Parameters<typeof prisma.lead.findMany>[0] extends infer T
      ? T extends { where?: infer W }
        ? W
        : never
      : never = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: "insensitive" } },
              { email: { contains: filter.search, mode: "insensitive" } },
              { phone: { contains: filter.search } },
            ],
          }
        : {}),
    };

    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filter.limit ?? 50,
        skip: filter.offset ?? 0,
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, totalCount };
  } catch {
    return { leads: [], totalCount: 0 };
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (!isDbAvailable()) return null;
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.lead.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nový",
  CONTACTED: "Kontaktovaný",
  QUOTED: "Ponuka odoslaná",
  WON: "Vyhraný",
  LOST: "Stratený",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  QUOTED: "bg-purple-100 text-purple-800",
  WON: "bg-emerald-100 text-emerald-800",
  LOST: "bg-zinc-100 text-zinc-600",
};
