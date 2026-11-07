import { z } from "zod";

export const MAX_ADMIN_CREDIT_RUPEES = 1_000_000; // Rs 10,00,000

export const adminCreditRupeesSchema = z.object({
  user_email: z.email("Enter a valid email"),
  amount_rupees: z
    .number({ error: "Enter an amount" })
    .positive("Amount must be greater than zero")
    .max(MAX_ADMIN_CREDIT_RUPEES, "Maximum Rs 10,00,000"),
  description: z.string().max(255, "At most 255 characters").optional(),
});

export type AdminCreditRupeesForm = z.infer<typeof adminCreditRupeesSchema>;
