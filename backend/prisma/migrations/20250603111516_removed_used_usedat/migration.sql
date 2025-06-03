/*
  Warnings:

  - You are about to drop the column `used` on the `auth_nonces` table. All the data in the column will be lost.
  - You are about to drop the column `used_at` on the `auth_nonces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth_nonces" DROP COLUMN "used",
DROP COLUMN "used_at";
