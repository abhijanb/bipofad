import { z } from "zod";

export const MIN_COLLECTION_PAISA = 1_000; // Rs 10
export const MAX_COLLECTION_PAISA = 10_000_000; // Rs 1,00,000

export const collectSilverSchema = z.object({
  amount_paisa: z
    .number({ error: "Enter an amount" })
    .int("Use whole paisa")
    .min(MIN_COLLECTION_PAISA, "Minimum Rs 10")
    .max(MAX_COLLECTION_PAISA, "Maximum Rs 1,00,000"),
});

export type CollectSilverForm = z.infer<typeof collectSilverSchema>;

// The page asks for rupees; the API takes paisa.
export const collectSilverRupeesSchema = z.object({
  amount_rupees: z
    .number({ error: "Enter an amount" })
    .min(MIN_COLLECTION_PAISA / 100, "Minimum Rs 10")
    .max(MAX_COLLECTION_PAISA / 100, "Maximum Rs 1,00,000"),
});

export type CollectSilverRupeesForm = z.infer<typeof collectSilverRupeesSchema>;
