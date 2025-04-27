/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[referal_code]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `is_verified` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `point` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referal_code` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
DROP COLUMN "isVerified",
DROP COLUMN "roleId",
ADD COLUMN     "is_verified" BOOLEAN NOT NULL,
ADD COLUMN     "point" INTEGER NOT NULL,
ADD COLUMN     "profile_pict" TEXT,
ADD COLUMN     "referal_code" TEXT NOT NULL,
ADD COLUMN     "status_role" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "Role";

-- CreateIndex
CREATE UNIQUE INDEX "User_referal_code_key" ON "User"("referal_code");
