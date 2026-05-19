import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client — v dev mode HMR by inak vytváral nové inštancie
 * pri každom rebuilde, čo vedie k "too many connections" v Postgres.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
