import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Singleton Prisma client kompatibilný s Cloudflare Workers / Pages edge runtime.
 *
 * Používa @neondatabase/serverless driver cez @prisma/adapter-neon — to umožňuje
 * Prisma bežať v Workers runtime (HTTP namiesto TCP). Funguje rovnako aj na
 * Node.js bez zmeny.
 *
 * LAZY INIT: Prisma client sa nevyrobí kým ho niekto reálne nepoužije. Build-time
 * (next build "Collecting page data") môže importnúť modul bez DATABASE_URL —
 * čo by inak crash-lo. Cez Proxy odložíme inštanciáciu na prvý volaný method.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set at runtime. Set it in Cloudflare Pages env vars.",
    );
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Proxy ktorý vytvorí PrismaClient až keď je reálne potrebný.
 * Build-time import nepadne aj keď DATABASE_URL chýba.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createClient();
    }
    const client = globalForPrisma.prisma;
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
