-- ============================================================================
-- EPOXIDOVO Lead Software — call scheduling support
-- ============================================================================
-- Pridáva 2 stĺpce do Lead pre sledovanie hovorov a plánovaných retry:
--   • lastCallAt — kedy sa naposledy volalo (úspech aj neúspech)
--   • nextCallAt — kedy zavolať znova (auto 6h/24h po nedvíhnutí, alebo
--     manuálne naplánovaný termín)
-- ============================================================================

ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "lastCallAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nextCallAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Lead_nextCallAt_idx" ON "Lead"("nextCallAt");
