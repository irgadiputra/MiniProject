/*
  Warnings:

  - You are about to drop the column `discountedAmount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `originalAmount` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "discountedAmount",
DROP COLUMN "originalAmount",
ADD COLUMN     "discounted_amount" INTEGER,
ADD COLUMN     "event_id" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "original_amount" INTEGER NOT NULL DEFAULT 1000;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
