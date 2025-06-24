/*
  Warnings:

  - Made the column `signedRawTxnHash` on table `user_strategies` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_strategies" ALTER COLUMN "signedRawTxnHash" SET NOT NULL;
