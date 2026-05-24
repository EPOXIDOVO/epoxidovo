import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Singleton Prisma client kompatibilný s Cloudflare Workers / Pages edge runtime.
 *
 * Používa @neondatabase/serverless driver cez @prisma/adapter-neon — to umožňuje
 * Prisma bežať v Workers runtime (HTTP namiesto TCP). Funguje rovnako aj na
 * Node.js bez zmeny.
 *
 * V dev mode HMR by inak vytváral nové inštancie pri každom rebuilde,
 * preto singleton cez globalForPrisma.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
