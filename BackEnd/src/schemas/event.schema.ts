import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().nonempty("Event name is required"),
  location: z.string().nonempty("Location is required"),
  start_date: z.coerce.date().refine(d => !isNaN(d.getTime()), {
    message: "Start date is required",
  }),
  end_date: z.coerce.date().refine(d => !isNaN(d.getTime()), {
    message: "End date is required",
  }),
  quota: z.coerce.number().int().positive("Quota must be a positive number"),
  price: z.coerce.number().int().nonnegative("Price must be a non-negative number"),
  description: z.string().nonempty("Description is required"),
});

export const updateEventSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  quota: z.string().optional(), 
  price: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});