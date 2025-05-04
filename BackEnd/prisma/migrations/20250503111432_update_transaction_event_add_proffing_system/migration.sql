-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "expired_at" TIMESTAMP(3),
ADD COLUMN     "payment_proof" TEXT,
ADD COLUMN     "payment_uploaded_at" TIMESTAMP(3);
