-- CreateEnum
CREATE TYPE "DMA_STATUS" AS ENUM ('ABOVE', 'BELOW');

-- CreateTable
CREATE TABLE "dma_status" (
    "id" TEXT NOT NULL,
    "asset" "ASSET_TYPE" NOT NULL,
    "current_price" VARCHAR(50) NOT NULL,
    "dma_200" VARCHAR(50) NOT NULL,
    "status" "DMA_STATUS" NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dma_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_transaction_logs" (
    "id" TEXT NOT NULL,
    "wallet_address" VARCHAR(42) NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "execution_id" TEXT,
    "asset" "ASSET_TYPE" NOT NULL,
    "transaction_hash" TEXT,
    "amount" VARCHAR(50) NOT NULL,
    "plan_type" "STRATEGY_TYPE" NOT NULL,
    "error_message" TEXT,
    "failed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alert_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_transaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dma_status_asset_idx" ON "dma_status"("asset");

-- CreateIndex
CREATE INDEX "dma_status_calculated_at_idx" ON "dma_status"("calculated_at");

-- CreateIndex
CREATE UNIQUE INDEX "dma_status_asset_calculated_at_key" ON "dma_status"("asset", "calculated_at" DESC);

-- CreateIndex
CREATE INDEX "failed_transaction_logs_wallet_address_idx" ON "failed_transaction_logs"("wallet_address");

-- CreateIndex
CREATE INDEX "failed_transaction_logs_failed_at_idx" ON "failed_transaction_logs"("failed_at");

-- CreateIndex
CREATE INDEX "failed_transaction_logs_alert_sent_idx" ON "failed_transaction_logs"("alert_sent");

-- AddForeignKey
ALTER TABLE "failed_transaction_logs" ADD CONSTRAINT "failed_transaction_logs_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "user_strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
