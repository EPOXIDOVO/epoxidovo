-- E-shop objednávky pre štatistiky v /admin/ceny (e-mail ostáva primárny kanál)
CREATE TABLE IF NOT EXISTS "EshopOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subtotalEur" DOUBLE PRECISION NOT NULL,
    "shippingId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "hasOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    CONSTRAINT "EshopOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EshopOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nazov" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "cenaEur" DOUBLE PRECISION,
    CONSTRAINT "EshopOrderItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EshopOrderItem_orderId_fkey" FOREIGN KEY ("orderId")
      REFERENCES "EshopOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "EshopOrderItem_sku_idx" ON "EshopOrderItem"("sku");
