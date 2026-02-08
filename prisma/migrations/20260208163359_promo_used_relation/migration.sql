/*
  Warnings:

  - A unique constraint covering the columns `[usedByReservationId]` on the table `PromoCode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "usedByReservationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_usedByReservationId_key" ON "PromoCode"("usedByReservationId");

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_usedByReservationId_fkey" FOREIGN KEY ("usedByReservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
