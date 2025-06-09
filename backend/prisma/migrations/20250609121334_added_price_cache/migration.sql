-- CreateTable
CREATE TABLE "price_cache" (
    "id" TEXT NOT NULL,
    "asset" "ASSET_TYPE" NOT NULL,
    "price" VARCHAR(50) NOT NULL,
    "source" VARCHAR(10) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_cache_asset_timestamp_idx" ON "price_cache"("asset", "timestamp");

-- CreateIndex
CREATE INDEX "price_cache_asset_source_idx" ON "price_cache"("asset", "source");

-- CreateIndex
CREATE INDEX "price_cache_timestamp_idx" ON "price_cache"("timestamp");
