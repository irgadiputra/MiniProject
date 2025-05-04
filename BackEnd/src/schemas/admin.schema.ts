import { z } from "zod";

export const CreateCouponSchema = z.object({
  code: z.string().min(3),
  discount: z.string().min(1),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
});