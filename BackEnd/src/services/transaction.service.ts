import prisma from "../lib/prisma";
import { EventListQuery } from "../type/event.type";
import { CreateTransaction } from "../type/transaction.type";

import handlebars from "handlebars";
import path from "path";
import fs from "fs";
import { Transporter } from "../utils/nodemailer";

async function CreateTransactionService(
    userId: number,
    param: CreateTransaction
) {
    let point = param.point ? param.point : 0;
    const event = await prisma.event.findUnique({
        where: { id: param.eventId },
    });

    if (!event) throw new Error("Event not found");
    if (event.quota < param.quantity) throw new Error("Not enough ticket quota");

    const now = new Date();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    if (user.point < point) throw new Error("Not enough user points");

    let voucher = null;
    let coupon = null;
    let voucherDiscount = 0;
    let couponDiscount = 0;

    const original_amount = event.price * param.quantity;

    // Check voucher
    if (param.voucher_code) {
        voucher = await prisma.voucher.findUnique({ where: { code: param.voucher_code } });
        if (!voucher) throw new Error("Invalid voucher code");
        if (voucher.start_date > now || voucher.end_date < now)
            throw new Error("Voucher expired or not active");
        if (voucher.event_id !== param.eventId)
            throw new Error("Voucher not valid for this event");

        voucherDiscount = calculateDiscount(voucher.discount, original_amount);
    }

    // Check coupon
    if (param.coupon_code) {
        coupon = await prisma.coupon.findUnique({ where: { code: param.coupon_code } });
        if (!coupon) throw new Error("Invalid coupon code");
        if (coupon.start_date > now || coupon.end_date < now)
            throw new Error("Coupon expired or not active");

        couponDiscount = calculateDiscount(coupon.discount, original_amount);
    }

    const totalDiscount = voucherDiscount + couponDiscount + point;
    const discounted_amount = Math.max(original_amount - totalDiscount, 0);

    const expirationTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const transaction = await prisma.transaction.create({
        data: {
            user_id: userId,
            quantity: param.quantity,
            original_amount,
            discounted_amount: totalDiscount,
            total_price: discounted_amount,
            point_reward: Math.floor(discounted_amount * 0.1),
            point,
            voucher_id: voucher?.id,
            coupon_id: coupon?.id,
            status: "WAITING_PAYMENT",
            event_id: event.id,
            expired_at: expirationTime,
        },
    });

    // Decrease event quota
    await prisma.event.update({
        where: { id: param.eventId },
        data: { quota: { decrement: param.quantity } },
    });

    // Deduct user points
    if (point > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { point: { decrement: point } },
        });

        await prisma.pointHistory.create({
            data: {
                userId,
                points: -point,
                description: "Used points in transaction",
                expiresAt: now, // already used, so immediate
            },
        });
    }

    return transaction;
}

async function getTransactionListService(userId: number) {
    const transactions = await prisma.transaction.findMany({
        where: { user_id: userId },
        include: {
            event: true,
            user: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return transactions;
}


async function getTransactionByIdService(
    userId: number,
    transactionId: number
) {
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true, event: true } // Including related user and event data
    });

    if (!transaction) {
        throw new Error("Transaction not found.");
    }

    if (transaction.user_id !== userId) {
        throw new Error("Unauthorized access to this transaction.");
    }

    return transaction;
}


async function UpdateTransactionStatusService(
    organizerId: number,
    transactionId: number,
    status: string,
) {
    const validStatuses = ["REJECTED", "DONE"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value.");
    }

    let transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
    });

    if (!transaction) {
        throw new Error("Transaction not found.");
    }

    if (transaction.status === status) {
        return { message: "No status change needed." };
    }

    const event = await prisma.event.findUnique({
        where: { id: transaction.event_id },
    });

    if (!event) throw new Error("Event not found");
    if (event.organizer_id !== organizerId) throw new Error("Unauthorized");

    const userId = transaction.user_id;
    const usedPoint = transaction.point || 0;
    const rewardPoint = transaction.point_reward || 0;

    const actions: any[] = [];

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.is_verified) {
        // Update the transaction status
        actions.push(
            prisma.transaction.update({
                where: { id: transactionId },
                data: { status, confirmed_at: new Date(Date.now())},
            })
        );

        if (status === "DONE") {
            // Only reward the user
            if (rewardPoint > 0) {
                actions.push(
                    prisma.user.update({
                        where: { id: userId },
                        data: {
                            point: transaction.user.point + rewardPoint,
                        },
                    }),
                    prisma.pointHistory.create({
                        data: {
                            userId,
                            points: rewardPoint,
                            description: `Reward from transaction #${transactionId}`,
                            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                        },
                    })
                );
            }
        }

        if (status === "REJECTED") {
            if (usedPoint > 0) {
                actions.push(
                    prisma.user.update({
                        where: { id: userId },
                        data: {
                            point: transaction.user.point + usedPoint,
                        },
                    }),
                    prisma.pointHistory.create({
                        data: {
                            userId,
                            points: usedPoint,
                            description: `Rollback from failed transaction #${transactionId}`,
                            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                        },
                    })
                );
            }

            // Restore event quota
            if (transaction.quantity > 0 && transaction.event_id) {
                actions.push(
                    prisma.event.update({
                        where: { id: transaction.event_id },
                        data: {
                            quota: {
                                increment: transaction.quantity,
                            },
                        },
                    })
                );
            }
        }

        const templatePath = path.join(
            __dirname,
            "../utils/templates",
            "transaction-template.hbs"
        );
        // Register 'eq' helper
        handlebars.registerHelper("eq", function (a, b) {
            return a === b;
        });
        const templateSource = fs.readFileSync(templatePath, "utf-8");
        const compiledTemplate = handlebars.compile(templateSource);
        transaction.status = status;
        const html = compiledTemplate(transaction)

        await Transporter.sendMail({
            from: "LoketKita",
            to: user?.email,
            subject: "Payment Status",
            html
        });

        await prisma.$transaction(actions);
    } else {
        throw new Error("User email is not verified.");
    }
    return { message: `Transaction updated to ${status}` };
}

async function UploadPaymentProofService(
    id: number,
    file: Express.Multer.File
) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: id },
        });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        let uploadedUrl = "";
        if (file) uploadedUrl = `/tra/${file.filename}`;

        const transactionProof = await prisma.transaction.update({
            where: { id: id },
            data: {
                payment_proof: uploadedUrl,
                payment_uploaded_at: new Date(),
                status: "WAITING_CONFIRMATION",
            },
        });

        return transactionProof;
    } catch (err) {
        throw err;
    }
}

//corn task
async function AutoExpireTransactions() {
    const expiredTransactions = await prisma.transaction.findMany({
        where: {
            status: "WAITING_PAYMENT",
            expired_at: { lt: new Date() },
        },
    });

    for (const tx of expiredTransactions) {
        await prisma.transaction.update({
            where: { id: tx.id },
            data: { status: "EXPIRED" },
        });

        // Rollback quota
        await prisma.event.update({
            where: { id: tx.event_id },
            data: { quota: { increment: tx.quantity } },
        });

        // Rollback points
        if (tx.point && tx.point > 0) {
            await prisma.user.update({
                where: { id: tx.user_id },
                data: { point: { increment: tx.point } },
            });

            await prisma.pointHistory.create({
                data: {
                    userId: tx.user_id,
                    points: tx.point,
                    description: "Refunded points (transaction expired)",
                    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                },
            });
        }

        console.log(`Transaction ${tx.id} expired and rolled back`);
    }
}

async function AutoCancelTransactions() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const toCancel = await prisma.transaction.findMany({
        where: {
            status: "WAITING_CONFIRMATION",
            payment_uploaded_at: { lt: threeDaysAgo },
        },
    });

    for (const tx of toCancel) {
        await prisma.transaction.update({
            where: { id: tx.id },
            data: { status: "CANCELED" },
        });

        // Rollback quota
        await prisma.event.update({
            where: { id: tx.event_id },
            data: { quota: { increment: tx.quantity } },
        });

        // Rollback points
        if (tx.point && tx.point > 0) {
            await prisma.user.update({
                where: { id: tx.user_id },
                data: { point: { increment: tx.point } },
            });

            await prisma.pointHistory.create({
                data: {
                    userId: tx.user_id,
                    points: tx.point,
                    description: "Refunded points (transaction canceled)",
                    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                },
            });
        }

        console.log(`Transaction ${tx.id} auto-canceled and rolled back`);
    }
}

//general func
function calculateDiscount(discountStr: string, price: number): number {
    if (discountStr.endsWith('%')) {
        const percent = parseFloat(discountStr.slice(0, -1));
        return Math.floor(price * (percent / 100));
    } else {
        return parseInt(discountStr, 10);
    }
}

export {
    CreateTransactionService,
    UpdateTransactionStatusService,
    UploadPaymentProofService,
    AutoExpireTransactions,
    AutoCancelTransactions,
    getTransactionByIdService,
    getTransactionListService
}
