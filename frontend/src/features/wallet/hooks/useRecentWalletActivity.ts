import type { WalletTransaction } from "../types";
import { useWalletRows } from "./useWalletRows";

type Params = {
  transactions?: WalletTransaction[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function useRecentWalletActivity({
  transactions,
  isLoading,
  isError,
  onRetry,
}: Params) {
  return {
    rows: useWalletRows(transactions, 5),
    isLoading,
    isError,
    onRetry,
  };
}
