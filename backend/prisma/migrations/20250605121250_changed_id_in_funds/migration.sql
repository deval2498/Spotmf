/*
  Warnings:

  - You are about to drop the column `userId` on the `Funds` table. All the data in the column will be lost.
  - Added the required column `walletAddress` to the `Funds` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Funds" DROP CONSTRAINT "Funds_userId_fkey";

-- AlterTable
ALTER TABLE "Funds" DROP COLUMN "userId",
ADD COLUMN     "walletAddress" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Funds" ADD CONSTRAINT "Funds_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;
