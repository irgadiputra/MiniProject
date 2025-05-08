"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCouponSchema = void 0;
const zod_1 = require("zod");
exports.CreateCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(3),
    discount: zod_1.z.string().min(1),
    start_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }),
    end_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date",
    }),
});
