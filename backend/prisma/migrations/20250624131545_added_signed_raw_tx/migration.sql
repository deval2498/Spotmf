-- AlterTable
ALTER TABLE "user_strategies" ADD COLUMN     "signedRawTxnHash" TEXT,
ALTER COLUMN "isActive" SET DEFAULT false;
