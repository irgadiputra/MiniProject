"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionService = CreateTransactionService;
exports.UpdateTransactionStatusService = UpdateTransactionStatusService;
exports.UploadPaymentProofService = UploadPaymentProofService;
exports.AutoExpireTransactions = AutoExpireTransactions;
exports.AutoCancelTransactions = AutoCancelTransactions;
const prisma_1 = __importDefault(require("../lib/prisma"));
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = require("../utils/nodemailer");
function CreateTransactionService(userId, param) {
    return __awaiter(this, void 0, void 0, function* () {
        let point = param.point ? param.point : 0;
        const event = yield prisma_1.default.event.findUnique({
            where: { id: param.eventId },
        });
        if (!event)
            throw new Error("Event not found");
        if (event.quota < param.quantity)
            throw new Error("Not enough ticket quota");
        const now = new Date();
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("User not found");
        if (user.point < point)
            throw new Error("Not enough user points");
        let voucher = null;
        let coupon = null;
        let voucherDiscount = 0;
        let couponDiscount = 0;
        const original_amount = event.price * param.quantity;
        // Check voucher
        if (param.voucher_code) {
            voucher = yield prisma_1.default.voucher.findUnique({ where: { code: param.voucher_code } });
            if (!voucher)
                throw new Error("Invalid voucher code");
            if (voucher.start_date > now || voucher.end_date < now)
                throw new Error("Voucher expired or not active");
            if (voucher.event_id !== param.eventId)
                throw new Error("Voucher not valid for this event");
            voucherDiscount = calculateDiscount(voucher.discount, original_amount);
        }
        // Check coupon
        if (param.coupon_code) {
            coupon = yield prisma_1.default.coupon.findUnique({ where: { code: param.coupon_code } });
            if (!coupon)
                throw new Error("Invalid coupon code");
            if (coupon.start_date > now || coupon.end_date < now)
                throw new Error("Coupon expired or not active");
            couponDiscount = calculateDiscount(coupon.discount, original_amount);
        }
        const totalDiscount = voucherDiscount + couponDiscount + point;
        const discounted_amount = Math.max(original_amount - totalDiscount, 0);
        const expirationTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
        const transaction = yield prisma_1.default.transaction.create({
            data: {
                user_id: userId,
                quantity: param.quantity,
                original_amount,
                discounted_amount: totalDiscount,
                total_price: discounted_amount,
                point_reward: Math.floor(discounted_amount * 0.1),
                point,
                voucher_id: voucher === null || voucher === void 0 ? void 0 : voucher.id,
                coupon_id: coupon === null || coupon === void 0 ? void 0 : coupon.id,
                status: "WAITING_PAYMENT",
                event_id: event.id,
                expired_at: expirationTime,
            },
        });
        // Decrease event quota
        yield prisma_1.default.event.update({
            where: { id: param.eventId },
            data: { quota: { decrement: param.quantity } },
        });
        // Deduct user points
        if (point > 0) {
            yield prisma_1.default.user.update({
                where: { id: userId },
                data: { point: { decrement: point } },
            });
            yield prisma_1.default.pointHistory.create({
                data: {
                    userId,
                    points: -point,
                    description: "Used points in transaction",
                    expiresAt: now, // already used, so immediate
                },
            });
        }
        return transaction;
    });
}
function UpdateTransactionStatusService(organizerId, transactionId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const validStatuses = ["REJECTED", "DONE"];
        if (!validStatuses.includes(status)) {
            throw new Error("Invalid status value.");
        }
        let transaction = yield prisma_1.default.transaction.findUnique({
            where: { id: transactionId },
            include: { user: true },
        });
        if (!transaction) {
            throw new Error("Transaction not found.");
        }
        if (transaction.status === status) {
            return { message: "No status change needed." };
        }
        const event = yield prisma_1.default.event.findUnique({
            where: { id: transaction.event_id },
        });
        if (!event)
            throw new Error("Event not found");
        if (event.organizer_id !== organizerId)
            throw new Error("Unauthorized");
        const userId = transaction.user_id;
        const usedPoint = transaction.point || 0;
        const rewardPoint = transaction.point_reward || 0;
        const actions = [];
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (user === null || user === void 0 ? void 0 : user.is_verified) {
            // Update the transaction status
            actions.push(prisma_1.default.transaction.update({
                where: { id: transactionId },
                data: { status },
            }));
            if (status === "DONE") {
                // Only reward the user
                if (rewardPoint > 0) {
                    actions.push(prisma_1.default.user.update({
                        where: { id: userId },
                        data: {
                            point: transaction.user.point + rewardPoint,
                        },
                    }), prisma_1.default.pointHistory.create({
                        data: {
                            userId,
                            points: rewardPoint,
                            description: `Reward from transaction #${transactionId}`,
                            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                        },
                    }));
                }
            }
            if (status === "REJECTED") {
                if (usedPoint > 0) {
                    actions.push(prisma_1.default.user.update({
                        where: { id: userId },
                        data: {
                            point: transaction.user.point + usedPoint,
                        },
                    }), prisma_1.default.pointHistory.create({
                        data: {
                            userId,
                            points: usedPoint,
                            description: `Rollback from failed transaction #${transactionId}`,
                            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                        },
                    }));
                }
                // Restore event quota
                if (transaction.quantity > 0 && transaction.event_id) {
                    actions.push(prisma_1.default.event.update({
                        where: { id: transaction.event_id },
                        data: {
                            quota: {
                                increment: transaction.quantity,
                            },
                        },
                    }));
                }
            }
            const templatePath = path_1.default.join(__dirname, "../utils/templates", "transaction-template.hbs");
            // Register 'eq' helper
            handlebars_1.default.registerHelper("eq", function (a, b) {
                return a === b;
            });
            const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
            const compiledTemplate = handlebars_1.default.compile(templateSource);
            transaction.status = status;
            const html = compiledTemplate(transaction);
            yield nodemailer_1.Transporter.sendMail({
                from: "LoketKita",
                to: user === null || user === void 0 ? void 0 : user.email,
                subject: "Payment Status",
                html
            });
            yield prisma_1.default.$transaction(actions);
        }
        else {
            throw new Error("User email is not verified.");
        }
        return { message: `Transaction updated to ${status}` };
    });
}
function UploadPaymentProofService(id, file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transaction = yield prisma_1.default.transaction.findUnique({
                where: { id: id },
            });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            let uploadedUrl = "";
            if (file)
                uploadedUrl = `/public/transaction/${file.filename}`;
            const transactionProof = yield prisma_1.default.transaction.update({
                where: { id: id },
                data: {
                    payment_proof: uploadedUrl,
                    payment_uploaded_at: new Date(),
                    status: "WAITING_CONFIRMATION",
                },
            });
            return transactionProof;
        }
        catch (err) {
            throw err;
        }
    });
}
//corn task
function AutoExpireTransactions() {
    return __awaiter(this, void 0, void 0, function* () {
        const expiredTransactions = yield prisma_1.default.transaction.findMany({
            where: {
                status: "WAITING_PAYMENT",
                expired_at: { lt: new Date() },
            },
        });
        for (const tx of expiredTransactions) {
            yield prisma_1.default.transaction.update({
                where: { id: tx.id },
                data: { status: "EXPIRED" },
            });
            // Rollback quota
            yield prisma_1.default.event.update({
                where: { id: tx.event_id },
                data: { quota: { increment: tx.quantity } },
            });
            // Rollback points
            if (tx.point && tx.point > 0) {
                yield prisma_1.default.user.update({
                    where: { id: tx.user_id },
                    data: { point: { increment: tx.point } },
                });
                yield prisma_1.default.pointHistory.create({
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
    });
}
function AutoCancelTransactions() {
    return __awaiter(this, void 0, void 0, function* () {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const toCancel = yield prisma_1.default.transaction.findMany({
            where: {
                status: "WAITING_CONFIRMATION",
                payment_uploaded_at: { lt: threeDaysAgo },
            },
        });
        for (const tx of toCancel) {
            yield prisma_1.default.transaction.update({
                where: { id: tx.id },
                data: { status: "CANCELED" },
            });
            // Rollback quota
            yield prisma_1.default.event.update({
                where: { id: tx.event_id },
                data: { quota: { increment: tx.quantity } },
            });
            // Rollback points
            if (tx.point && tx.point > 0) {
                yield prisma_1.default.user.update({
                    where: { id: tx.user_id },
                    data: { point: { increment: tx.point } },
                });
                yield prisma_1.default.pointHistory.create({
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
    });
}
//general func
function calculateDiscount(discountStr, price) {
    if (discountStr.endsWith('%')) {
        const percent = parseFloat(discountStr.slice(0, -1));
        return Math.floor(price * (percent / 100));
    }
    else {
        return parseInt(discountStr, 10);
    }
}
