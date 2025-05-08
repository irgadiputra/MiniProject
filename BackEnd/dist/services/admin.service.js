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
exports.createCouponService = createCouponService;
exports.deleteCouponService = deleteCouponService;
const prisma_1 = __importDefault(require("../lib/prisma"));
function createCouponService(userId, input) {
    return __awaiter(this, void 0, void 0, function* () {
        isAdmin(userId);
        const existing = yield prisma_1.default.coupon.findUnique({
            where: { code: input.code },
        });
        if (existing)
            throw new Error("Coupon code already exists");
        const coupon = yield prisma_1.default.coupon.create({
            data: {
                code: input.code,
                discount: input.discount,
                start_date: input.start_date,
                end_date: input.end_date,
            },
        });
        return coupon;
    });
}
function deleteCouponService(userId, code) {
    return __awaiter(this, void 0, void 0, function* () {
        isAdmin(userId);
        const coupon = yield prisma_1.default.coupon.findUnique({
            where: { code },
        });
        if (!coupon)
            throw new Error("Coupon not found");
        yield prisma_1.default.coupon.delete({
            where: { code },
        });
        return { message: "Coupon deleted successfully" };
    });
}
function isAdmin(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.event.findUnique({
            where: { id: userId },
        });
        if ((user === null || user === void 0 ? void 0 : user.status) != "admin")
            throw new Error("Unauthorized");
    });
}
