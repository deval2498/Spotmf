/*
  Warnings:

  - You are about to drop the column `accepted_slippage` on the `user_strategies` table. All the data in the column will be lost.
  - You are about to drop the column `approved_amount` on the `user_strategies` table. All the data in the column will be lost.
  - You are about to drop the column `asset` on the `user_strategies` table. All the data in the column will be lost.
  - You are about to drop the column `interval_amount` on the `user_strategies` table. All the data in the column will be lost.
  - You are about to drop the column `interval_days` on the `user_strategies` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `user_strategies` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_strategies_asset_type_idx";

-- AlterTable
ALTER TABLE "user_strategies" DROP COLUMN "accepted_slippage",
DROP COLUMN "approved_amount",
DROP COLUMN "asset",
DROP COLUMN "interval_amount",
DROP COLUMN "interval_days",
DROP COLUMN "type";
