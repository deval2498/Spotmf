/*
  Warnings:

  - You are about to drop the column `assetName` on the `historical_prices` table. All the data in the column will be lost.
  - You are about to drop the column `assetName` on the `price_cache` table. All the data in the column will be lost.
  - Added the required column `asset_name` to the `historical_prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asset_name` to the `price_cache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "historical_prices" DROP COLUMN "assetName",
ADD COLUMN     "asset_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "price_cache" DROP COLUMN "assetName",
ADD COLUMN     "asset_name" TEXT NOT NULL;
