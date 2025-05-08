import { error } from "console";
import prisma from "../lib/prisma";
import { CreateCoupon } from "../type/admin.type";

async function createCouponService(
    userId: number,
    input: CreateCoupon
) {
    isAdmin(userId);
    const existing = await prisma.coupon.findUnique({
        where: { code: input.code },
    });

    if (existing) throw new Error("Coupon code already exists");

    const coupon = await prisma.coupon.create({
        data: {
            code: input.code,
            discount: input.discount,
            start_date: input.start_date,
            end_date: input.end_date,
        },
    });

    return coupon;
}

async function deleteCouponService(
    userId: number,
    code: string
) {
    isAdmin(userId);
    const coupon = await prisma.coupon.findUnique({
        where: { code },
    });

    if (!coupon) throw new Error("Coupon not found");

    await prisma.coupon.delete({
        where: { code },
    });

    return { message: "Coupon deleted successfully" };
}

async function isAdmin(
    userId: number,
) {
    const user = await prisma.event.findUnique({
        where: { id: userId },
    });
    if (user?.status != "admin") throw new Error("Unauthorized");
}

export { createCouponService, deleteCouponService }