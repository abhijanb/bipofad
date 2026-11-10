import type { VaultProduct } from "@/features/vault/types";

export type SavingsGoal = {
  id: number;
  product: VaultProduct;
  target_grams: number;
  balance_grams: number;
  progress_percent: number;
  remaining_grams: number;
  is_complete: boolean;
  value_paisa: number;
  price_per_gram_paisa: number | null;
  created_at: string;
  updated_at: string;
};

export type CreateGoalInput = {
  product: VaultProduct;
  target_grams: number;
};

export type UpdateGoalInput = {
  id: number;
  target_grams: number;
};

export type GoalResponse = {
  message: string;
  goal: SavingsGoal;
};

export type DeleteGoalResponse = {
  message: string;
};
