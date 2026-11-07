export type WalletTransactionType =
  | "demo_credit"
  | "admin_credit"
  | "deposit"
  | "silver_purchase"
  | "silver_sale"
  | "gold_purchase"
  | "gold_sale"
  | "refund"
  | "opening_balance"
  | "reversal";

export type WalletTransaction = {
  id: number;
  type: WalletTransactionType;
  amount_paisa: number;
  balance_after_paisa: number;
  reference_type: string | null;
  reference_id: number | null;
  description: string | null;
  created_at: string;
};

export type AdminCreditInput = {
  user_email: string;
  amount_paisa: number;
  description?: string;
  idempotency_key: string;
};

export type AdminCreditResponse = {
  message: string;
  transaction: WalletTransaction;
  balance_paisa: number;
};
