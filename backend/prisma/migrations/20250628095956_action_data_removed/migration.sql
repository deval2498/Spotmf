/*
  Warnings:

  - You are about to drop the column `action_data` on the `action_nonces` table. All the data in the column will be lost.
  - You are about to drop the column `contract_address` on the `user_strategies` table. All the data in the column will be lost.
  - Added the required column `accepted_slippage` to the `action_nonces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asset` to the `action_nonces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interval_amount` to the `action_nonces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interval_days` to the `action_nonces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strategy_type` to the `action_nonces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `action_nonces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "action_nonces" DROP COLUMN "action_data",
ADD COLUMN     "accepted_slippage" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "asset" "ASSET_TYPE" NOT NULL,
ADD COLUMN     "interval_amount" BIGINT NOT NULL,
ADD COLUMN     "interval_days" INTEGER NOT NULL,
ADD COLUMN     "strategy_id" TEXT,
ADD COLUMN     "strategy_type" "STRATEGY_TYPE" NOT NULL,
ADD COLUMN     "total_amount" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "user_strategies" DROP COLUMN "contract_address";
