import { WALLET_TRANSACTION_LABELS } from "../labels";
import type { WalletTransaction } from "../types";

export type WalletRow = WalletTransaction & {
  label: string;
  isCredit: boolean;
};

/** Maps raw ledger rows into display-ready rows. */
export function useWalletRows(
  transactions: WalletTransaction[] | undefined,
  limit?: number,
): WalletRow[] {
  const items =
    limit !== undefined ? transactions?.slice(0, limit) : transactions;

  return (items ?? []).map((transaction) => ({
    ...transaction,
    label: WALLET_TRANSACTION_LABELS[transaction.type] ?? transaction.type,
    isCredit: transaction.amount_paisa > 0,
  }));
}
