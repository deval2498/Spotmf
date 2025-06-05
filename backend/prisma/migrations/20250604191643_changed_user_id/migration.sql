/*
  Warnings:

  - You are about to drop the column `userId` on the `User_Strategy` table. All the data in the column will be lost.
  - Added the required column `walletAddress` to the `User_Strategy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User_Strategy" DROP CONSTRAINT "User_Strategy_userId_fkey";

-- AlterTable
ALTER TABLE "User_Strategy" DROP COLUMN "userId",
ADD COLUMN     "walletAddress" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "User_Strategy" ADD CONSTRAINT "User_Strategy_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;
