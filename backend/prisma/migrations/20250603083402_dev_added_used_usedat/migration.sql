/*
  Warnings:

  - Added the required column `used_at` to the `auth_nonces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auth_nonces" ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "used_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ;
