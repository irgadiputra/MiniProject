"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionSchema = void 0;
const zod_1 = require("zod");
exports.CreateTransactionSchema = zod_1.z.object({
    quantity: zod_1.z.number({
        required_error: "quantity is required",
        invalid_type_error: "quantity must be a number"
    }).min(1, "Quantity must be at least 1"),
    point: zod_1.z.number().optional(),
    voucher_code: zod_1.z.string().optional(),
    coupon_code: zod_1.z.string().optional(),
});
