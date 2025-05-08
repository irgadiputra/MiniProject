"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVoucherSchema = exports.updateEventSchema = exports.eventSchema = void 0;
const zod_1 = require("zod");
exports.eventSchema = zod_1.z.object({
    name: zod_1.z.string().nonempty("Event name is required"),
    location: zod_1.z.string().nonempty("Location is required"),
    start_date: zod_1.z.coerce.date().refine(d => !isNaN(d.getTime()), {
        message: "Start date is required",
    }),
    end_date: zod_1.z.coerce.date().refine(d => !isNaN(d.getTime()), {
        message: "End date is required",
    }),
    quota: zod_1.z.coerce.number().int().positive("Quota must be a positive number"),
    price: zod_1.z.coerce.number().int().nonnegative("Price must be a non-negative number"),
    description: zod_1.z.string().nonempty("Description is required"),
});
exports.updateEventSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    start_date: zod_1.z.string().optional(),
    end_date: zod_1.z.string().optional(),
    quota: zod_1.z.string().optional(),
    price: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
exports.CreateVoucherSchema = zod_1.z.object({
    code: zod_1.z.string().min(3),
    discount: zod_1.z.string().min(1),
    start_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }),
    end_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date",
    }),
});
