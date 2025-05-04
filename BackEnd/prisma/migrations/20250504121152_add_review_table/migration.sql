-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "event_id" DROP DEFAULT,
ALTER COLUMN "original_amount" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_user_id_event_id_key" ON "Review"("user_id", "event_id");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
