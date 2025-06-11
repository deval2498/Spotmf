/*
  Warnings:

  - Added the required column `assetName` to the `historical_prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetName` to the `price_cache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "historical_prices" ADD COLUMN     "assetName" TEXT NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "price_cache" ADD COLUMN     "assetName" TEXT NOT NULL;
