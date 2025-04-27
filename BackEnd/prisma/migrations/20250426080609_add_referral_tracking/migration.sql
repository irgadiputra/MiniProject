-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referred_by" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
