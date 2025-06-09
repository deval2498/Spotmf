/*
  Warnings:

  - You are about to drop the `User_Strategy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User_Strategy" DROP CONSTRAINT "User_Strategy_strategyId_fkey";

-- DropForeignKey
ALTER TABLE "User_Strategy" DROP CONSTRAINT "User_Strategy_walletAddress_fkey";

-- DropTable
DROP TABLE "User_Strategy";

-- CreateTable
CREATE TABLE "user_strategies" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "asset" "ASSET_TYPE" NOT NULL,
    "interval_amount" BIGINT NOT NULL,
    "interval_days" DECIMAL(65,30) NOT NULL,
    "accepted_slippage" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_executed_at" TIMESTAMP(3),
    "walletAddress" TEXT NOT NULL,

    CONSTRAINT "user_strategies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_strategies" ADD CONSTRAINT "user_strategies_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_strategies" ADD CONSTRAINT "user_strategies_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;
