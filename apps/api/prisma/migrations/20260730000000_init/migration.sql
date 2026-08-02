CREATE TYPE "UserRole" AS ENUM ('ADMIN');
CREATE TYPE "Marketplace" AS ENUM ('SHOPEE', 'TOKOPEDIA', 'TIKTOK', 'OTHER');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreProfile" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL DEFAULT 'main',
  "displayName" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "bio" TEXT,
  "avatarUrl" TEXT,
  "coverUrl" TEXT,
  "instagramUrl" TEXT,
  "tiktokUrl" TEXT,
  "whatsappUrl" TEXT,
  "themeColor" TEXT NOT NULL DEFAULT '#7c3aed',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "priceLabel" TEXT,
  "originalPriceLabel" TEXT,
  "imageUrl" TEXT,
  "affiliateUrl" TEXT NOT NULL,
  "marketplace" "Marketplace" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "clickCount" INTEGER NOT NULL DEFAULT 0,
  "categoryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductClick" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "userAgent" TEXT,
  "referrer" TEXT,
  "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductClick_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "StoreProfile_key_key" ON "StoreProfile"("key");
CREATE UNIQUE INDEX "StoreProfile_username_key" ON "StoreProfile"("username");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_isActive_sortOrder_idx" ON "Product"("isActive", "sortOrder");
CREATE INDEX "Product_marketplace_idx" ON "Product"("marketplace");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "ProductClick_productId_createdAt_idx" ON "ProductClick"("productId", "createdAt");
CREATE INDEX "ProductClick_createdAt_idx" ON "ProductClick"("createdAt");

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductClick" ADD CONSTRAINT "ProductClick_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
