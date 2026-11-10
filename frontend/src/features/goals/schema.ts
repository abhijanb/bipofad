import { z } from "zod";

export const goalGramsSchema = z.object({
  target_grams: z
    .number({ error: "Enter a target" })
    .int("Use whole grams")
    .min(1, "Enter at least 1 gram"),
});

export type GoalGramsForm = z.infer<typeof goalGramsSchema>;
