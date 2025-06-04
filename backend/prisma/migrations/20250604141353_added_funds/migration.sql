-- CreateEnum
CREATE TYPE "STRATEGY_TYPE" AS ENUM ('SIMPLE', 'DMA_200');

-- CreateEnum
CREATE TYPE "ASSET_TYPE" AS ENUM ('BTC', 'ETH', 'HYPE');

-- CreateTable
CREATE TABLE "Funds" (
    "id" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "amount" BIGINT NOT NULL DEFAULT 0,
    "contract_name" TEXT,
    "contract_symbol" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "type" "STRATEGY_TYPE" NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Strategy" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "asset" "ASSET_TYPE" NOT NULL,
    "interval_amount" BIGINT NOT NULL,
    "interval_days" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_executed_at" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "User_Strategy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Funds" ADD CONSTRAINT "Funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Strategy" ADD CONSTRAINT "User_Strategy_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Strategy" ADD CONSTRAINT "User_Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
