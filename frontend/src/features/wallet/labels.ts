import type { WalletTransactionType } from "./types";

export const WALLET_TRANSACTION_LABELS: Record<
  WalletTransactionType,
  string
> = {
  demo_credit: "Demo credit",
  admin_credit: "Admin credit",
  deposit: "Deposit",
  silver_purchase: "Silver purchase",
  silver_sale: "Silver cash-out",
  gold_purchase: "Gold purchase",
  gold_sale: "Gold cash-out",
  refund: "Refund",
  opening_balance: "Opening balance",
  reversal: "Reversal",
};
