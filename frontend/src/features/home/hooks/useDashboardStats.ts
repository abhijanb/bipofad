import { formatGrams, formatRupees } from "@/features/vault/format";
import type { VaultProduct, VaultSummary } from "@/features/vault/types";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";

type Params = {
  product: VaultProduct;
  summary?: VaultSummary;
  isLoading: boolean;
  isError: boolean;
};

/** Builds the three dashboard stat cards from the vault summary. */
export function useDashboardStats({
  product,
  summary,
  isLoading,
  isError,
}: Params) {
  const showValues = !isLoading && !isError;
  const price = summary?.price_per_gram_paisa ?? null;
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  const stats = [
    {
      label: "Wallet balance",
      value: showValues ? formatRupees(summary?.balance_paisa ?? 0) : "—",
      hint: `Available to buy ${lowerLabel}`,
    },
    {
      label: `${label} held`,
      value: showValues ? formatGrams(summary?.balance_grams ?? "0") : "—",
      hint: "Across all your collections",
    },
    {
      label: `${label} value`,
      value: showValues ? formatRupees(summary?.value_paisa ?? 0) : "—",
      hint: isLoading
        ? `Loading ${lowerLabel} price...`
        : price !== null
          ? `${formatRupees(price)} per gram`
          : "Price unavailable",
    },
  ];

  return { stats };
}
