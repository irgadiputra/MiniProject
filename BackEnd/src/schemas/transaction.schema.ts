import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  quantity: z.number({
    required_error: "quantity is required",
    invalid_type_error: "quantity must be a number"
  }).min(1, "Quantity must be at least 1"),
  point: z.number().optional(),
  voucher_code: z.string().optional(),
  coupon_code: z.string().optional(),
});
