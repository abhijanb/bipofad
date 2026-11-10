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

// Cash-out is entered in whole grams because the vault stores integer grams.
export const sellGramsSchema = z.object({
  grams: z
    .number({ error: "Enter grams" })
    .int("Use whole grams")
    .min(1, "Enter at least 1 gram"),
});

export type SellGramsForm = z.infer<typeof sellGramsSchema>;

// Admin rate entry uses rupees; the API stores integer paisa per gram.
export const setSilverPriceRupeesSchema = z.object({
  price_rupees: z
    .number({ error: "Enter a price" })
    .positive("Price must be greater than zero")
    .max(1_000_000, "Price is too high"),
});

export type SetSilverPriceRupeesForm = z.infer<
  typeof setSilverPriceRupeesSchema
>;
