-- CreateEnum
CREATE TYPE "STRATEGY_TYPE" AS ENUM ('DCA', 'DCA_WITH_DMA');

-- CreateEnum
CREATE TYPE "ASSET_TYPE" AS ENUM ('BTC', 'ETH', 'HYPE');

-- CreateEnum
CREATE TYPE "STRATEGY_STATUS" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EXECUTION_STATUS" AS ENUM ('PENDING', 'EXECUTING', 'SUCCESS', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" VARCHAR(42) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" VARCHAR(255),
    "name" VARCHAR(100),
    "profile_image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_nonces" (
    "wallet_address" VARCHAR(42) NOT NULL,
    "nonce" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "action_nonces" (
    "id" TEXT NOT NULL,
    "wallet_address" VARCHAR(42) NOT NULL,
    "nonce" VARCHAR(64) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "action_data" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_nonces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_strategies" (
    "id" TEXT NOT NULL,
    "wallet_address" VARCHAR(42) NOT NULL,
    "action_nonce_id" TEXT NOT NULL,
    "type" "STRATEGY_TYPE" NOT NULL,
    "asset" "ASSET_TYPE" NOT NULL,
    "interval_amount" BIGINT NOT NULL,
    "interval_days" INTEGER NOT NULL,
    "accepted_slippage" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "contract_address" TEXT,
    "approved_amount" BIGINT,
    "signed_raw_txn_hash" TEXT,
    "status" "STRATEGY_STATUS" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_executed_at" TIMESTAMP(3),
    "next_execution_at" TIMESTAMP(3),
    "total_executions" INTEGER NOT NULL DEFAULT 0,
    "total_amount_swapped" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "user_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_executions" (
    "id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_hash" TEXT,
    "status" "EXECUTION_STATUS" NOT NULL DEFAULT 'PENDING',
    "amount_in" BIGINT NOT NULL,
    "amount_out" BIGINT,
    "actual_slippage" DECIMAL(5,2),
    "gas_used" BIGINT,
    "gas_price_used" BIGINT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategy_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_cache" (
    "id" TEXT NOT NULL,
    "asset" "ASSET_TYPE" NOT NULL,
    "price" VARCHAR(50) NOT NULL,
    "source" VARCHAR(20) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historical_prices" (
    "id" TEXT NOT NULL,
    "asset" "ASSET_TYPE" NOT NULL,
    "date" DATE NOT NULL,
    "price" VARCHAR(50) NOT NULL,
    "source" VARCHAR(20) NOT NULL DEFAULT 'UNISWAP_V3',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historical_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "users_wallet_address_idx" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "auth_nonces_wallet_address_key" ON "auth_nonces"("wallet_address");

-- CreateIndex
CREATE INDEX "auth_nonces_expires_at_idx" ON "auth_nonces"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "action_nonces_nonce_key" ON "action_nonces"("nonce");

-- CreateIndex
CREATE INDEX "action_nonces_wallet_address_used_idx" ON "action_nonces"("wallet_address", "used");

-- CreateIndex
CREATE INDEX "action_nonces_expires_at_used_idx" ON "action_nonces"("expires_at", "used");

-- CreateIndex
CREATE INDEX "action_nonces_nonce_idx" ON "action_nonces"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "user_strategies_action_nonce_id_key" ON "user_strategies"("action_nonce_id");

-- CreateIndex
CREATE INDEX "user_strategies_wallet_address_isActive_idx" ON "user_strategies"("wallet_address", "isActive");

-- CreateIndex
CREATE INDEX "user_strategies_status_next_execution_at_idx" ON "user_strategies"("status", "next_execution_at");

-- CreateIndex
CREATE INDEX "user_strategies_asset_type_idx" ON "user_strategies"("asset", "type");

-- CreateIndex
CREATE INDEX "strategy_executions_strategy_id_executed_at_idx" ON "strategy_executions"("strategy_id", "executed_at");

-- CreateIndex
CREATE INDEX "strategy_executions_status_executed_at_idx" ON "strategy_executions"("status", "executed_at");

-- CreateIndex
CREATE INDEX "strategy_executions_transaction_hash_idx" ON "strategy_executions"("transaction_hash");

-- CreateIndex
CREATE INDEX "price_cache_asset_timestamp_idx" ON "price_cache"("asset", "timestamp");

-- CreateIndex
CREATE INDEX "price_cache_asset_source_idx" ON "price_cache"("asset", "source");

-- CreateIndex
CREATE INDEX "historical_prices_asset_idx" ON "historical_prices"("asset");

-- CreateIndex
CREATE INDEX "historical_prices_date_idx" ON "historical_prices"("date");

-- CreateIndex
CREATE UNIQUE INDEX "historical_prices_asset_date_key" ON "historical_prices"("asset", "date");

-- AddForeignKey
ALTER TABLE "action_nonces" ADD CONSTRAINT "action_nonces_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "users"("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_strategies" ADD CONSTRAINT "user_strategies_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "users"("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_strategies" ADD CONSTRAINT "user_strategies_action_nonce_id_fkey" FOREIGN KEY ("action_nonce_id") REFERENCES "action_nonces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_executions" ADD CONSTRAINT "strategy_executions_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "user_strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
