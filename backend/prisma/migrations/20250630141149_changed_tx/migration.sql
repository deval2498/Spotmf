/*
  Warnings:

  - You are about to drop the column `signed_raw_txn_hash` on the `user_strategies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_strategies" DROP COLUMN "signed_raw_txn_hash",
ADD COLUMN     "tx_hash_approval" TEXT;
