-- CreateTable
CREATE TABLE "TicketType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "total_price" INTEGER NOT NULL,
    "point_reward" INTEGER NOT NULL DEFAULT 0,
    "point" INTEGER,
    "voucher_id" INTEGER,
    "coupon_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
