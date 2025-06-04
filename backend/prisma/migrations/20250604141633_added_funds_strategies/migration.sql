/*
  Warnings:

  - Added the required column `tx_receipt` to the `Funds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Funds" ADD COLUMN     "tx_receipt" TEXT NOT NULL;
