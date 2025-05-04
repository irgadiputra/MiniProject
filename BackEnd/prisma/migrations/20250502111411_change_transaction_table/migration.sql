/*
  Warnings:

  - You are about to drop the column `ticket_id` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `TicketType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `originalAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TicketType" DROP CONSTRAINT "TicketType_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_ticket_id_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "ticket_id",
ADD COLUMN     "discountedAmount" INTEGER,
ADD COLUMN     "originalAmount" INTEGER NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- DropTable
DROP TABLE "TicketType";
