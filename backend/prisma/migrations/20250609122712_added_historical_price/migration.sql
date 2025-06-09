-- CreateTable
CREATE TABLE "historical_prices" (
    "id" TEXT NOT NULL,
    "asset" VARCHAR(10) NOT NULL,
    "date" DATE NOT NULL,
    "price" VARCHAR(50) NOT NULL,
    "source" VARCHAR(10) NOT NULL DEFAULT 'DEX',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historical_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historical_prices_asset_idx" ON "historical_prices"("asset");

-- CreateIndex
CREATE INDEX "historical_prices_asset_source_idx" ON "historical_prices"("asset", "source");

-- CreateIndex
CREATE INDEX "historical_prices_date_idx" ON "historical_prices"("date");

-- CreateIndex
CREATE UNIQUE INDEX "historical_prices_asset_date_key" ON "historical_prices"("asset", "date");
