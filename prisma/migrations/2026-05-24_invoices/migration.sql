-- ============================================================================
-- EPOXIDOVO — Invoice tracking
-- ============================================================================
-- Pridáva tabuľku Invoice + enum InvoiceStatus.
-- Faktúra môže byť voľne prepojená s leadom (leadId nullable).
-- ============================================================================

-- 1) Enum
DO $$ BEGIN
  CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Invoice table
CREATE TABLE IF NOT EXISTS "Invoice" (
  "id"            TEXT PRIMARY KEY,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  "leadId"        TEXT,
  "number"        TEXT,
  "customerName"  TEXT NOT NULL,
  "customerEmail" TEXT,
  "amount"        DECIMAL(10, 2) NOT NULL,
  "currency"      TEXT NOT NULL DEFAULT 'EUR',
  "description"   TEXT,
  "status"        "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
  "issuedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueAt"         TIMESTAMP(3),
  "paidAt"        TIMESTAMP(3),
  "notes"         TEXT
);

-- 3) Foreign key (so leadId → Lead.id, ON DELETE SET NULL)
DO $$ BEGIN
  ALTER TABLE "Invoice"
    ADD CONSTRAINT "Invoice_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4) Indexy
CREATE INDEX IF NOT EXISTS "Invoice_leadId_idx"   ON "Invoice"("leadId");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx"   ON "Invoice"("status");
CREATE INDEX IF NOT EXISTS "Invoice_issuedAt_idx" ON "Invoice"("issuedAt");
