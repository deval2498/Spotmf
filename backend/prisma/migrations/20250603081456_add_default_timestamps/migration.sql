-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" VARCHAR(42) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(255),
    "name" VARCHAR(100),
    "profileImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_nonces" (
    "wallet_address" VARCHAR(42) NOT NULL,
    "nonce" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "action_nonces" (
    "id" TEXT NOT NULL,
    "wallet_address" VARCHAR(42) NOT NULL,
    "nonce" VARCHAR(64) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "action_data" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_nonces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "users_wallet_address_idx" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "auth_nonces_wallet_address_key" ON "auth_nonces"("wallet_address");

-- CreateIndex
CREATE INDEX "auth_nonces_expires_at_idx" ON "auth_nonces"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "action_nonces_nonce_key" ON "action_nonces"("nonce");

-- CreateIndex
CREATE INDEX "action_nonces_wallet_address_nonce_used_idx" ON "action_nonces"("wallet_address", "nonce", "used");

-- CreateIndex
CREATE INDEX "action_nonces_expires_at_used_idx" ON "action_nonces"("expires_at", "used");

-- CreateIndex
CREATE INDEX "action_nonces_wallet_address_used_idx" ON "action_nonces"("wallet_address", "used");

-- CreateIndex
CREATE INDEX "action_nonces_nonce_idx" ON "action_nonces"("nonce");

-- CreateIndex
CREATE INDEX "action_nonces_expires_at_idx" ON "action_nonces"("expires_at");
