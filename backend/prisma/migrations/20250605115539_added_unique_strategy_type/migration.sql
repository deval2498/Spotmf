/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `Strategy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Strategy_type_key" ON "Strategy"("type");
