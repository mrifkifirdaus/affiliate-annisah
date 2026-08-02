CREATE TYPE "ProductMediaType" AS ENUM ('IMAGE', 'VIDEO');

CREATE TABLE "ProductMedia" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "type" "ProductMediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductMedia_productId_sortOrder_idx"
ON "ProductMedia"("productId", "sortOrder");

ALTER TABLE "ProductMedia"
ADD CONSTRAINT "ProductMedia_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
