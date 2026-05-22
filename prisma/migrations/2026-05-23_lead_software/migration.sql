-- ============================================================================
-- EPOXIDOVO Lead Software — DB schema update
-- ============================================================================
-- Spustite tento súbor v Neon SQL Editore (https://console.neon.tech) JEDNOU
-- transakciou. Pridáva:
--   • nové statusy do LeadStatus enum (CALLED_NO_ANSWER, REALIZED, NOT_INTERESTED)
--   • rolu AGENT do UserRole enum
--   • 4 nové stĺpce do Lead (failedCallCount, lastStatusChangeAt, followupSentAt,
--     reviewRequestSentAt)
--   • 2 nové stĺpce do User (active, createdAt)
--   • index na Lead.source
--   • default User.role zmena z VIEWER na AGENT
-- ============================================================================

-- 1) LeadStatus enum — pridať 3 nové hodnoty
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'CALLED_NO_ANSWER';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'REALIZED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'NOT_INTERESTED';

-- 2) UserRole enum — pridať AGENT
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'AGENT';

-- 3) Lead — 4 nové stĺpce
ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "failedCallCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastStatusChangeAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "followupSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewRequestSentAt" TIMESTAMP(3);

-- 4) Index na Lead.source (rýchle filtrovanie web/meta/google)
CREATE INDEX IF NOT EXISTS "Lead_source_idx" ON "Lead"("source");

-- 5) User — 2 nové stĺpce
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 6) User.role default sa zmení z VIEWER na AGENT
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'AGENT';

-- ============================================================================
-- Hotovo. Žiadne existujúce dáta sa nestratia — všetky ADD COLUMN sú s defaultom
-- a IF NOT EXISTS zabezpečí že sa migrácia dá spustiť opakovane bezpečne.
-- ============================================================================
