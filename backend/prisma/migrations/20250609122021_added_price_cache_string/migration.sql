/*
  Warnings:

  - Changed the type of `asset` on the `price_cache` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "price_cache" DROP COLUMN "asset",
ADD COLUMN     "asset" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "price_cache_asset_timestamp_idx" ON "price_cache"("asset", "timestamp");

-- CreateIndex
CREATE INDEX "price_cache_asset_source_idx" ON "price_cache"("asset", "source");
