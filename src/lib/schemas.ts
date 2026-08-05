import { z } from "zod";

export const billingFrequencySchema = z.enum([
  "monthly",
  "annual",
  "one_time",
  "other",
]);

export const itemStatusSchema = z.enum(["draft", "verified", "needs_review"]);

export const itemInputSchema = z.object({
  name: z.string().trim().min(1, "חובה להזין שם לפריט"),
  categoryId: z.string().trim().min(1, "חובה לבחור קטגוריה"),
  providerId: z.string().trim().optional().or(z.literal("")),
  providerFreeText: z.string().trim().optional().or(z.literal("")),
  accountOrPolicyNumber: z.string().trim().optional().or(z.literal("")),
  owner: z.string().trim().optional().or(z.literal("")),
  amount: z.coerce.number().nonnegative().optional(),
  billingFrequency: billingFrequencySchema.default("monthly"),
  startDate: z.string().trim().optional().or(z.literal("")),
  renewalOrEndDate: z.string().trim().optional().or(z.literal("")),
  status: itemStatusSchema.default("draft"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ItemInput = z.infer<typeof itemInputSchema>;
