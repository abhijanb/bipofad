import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";
import type { VaultProduct, VaultSummary } from "../types";

type Params = {
  product: VaultProduct;
  summary?: VaultSummary;
  isLoading: boolean;
  isError: boolean;
  errorDetail?: string;
  onRetry: () => void;
};

/** Derived values and labels for the vault balance card. */
export function useVaultBalanceCard({
  product,
  summary,
  isLoading,
  isError,
  errorDetail,
  onRetry,
}: Params) {
  return {
    summary,
    isLoading,
    isError,
    errorDetail,
    onRetry,
    price: summary?.price_per_gram_paisa ?? null,
    label: productLabel(product),
    lowerLabel: productLowerLabel(product),
  };
}
