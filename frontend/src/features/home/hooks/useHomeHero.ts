import { formatGrams, formatRupees } from "@/features/vault/format";
import type { VaultProduct, VaultSummary } from "@/features/vault/types";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";

export function useHomeHero(product: VaultProduct, summary?: VaultSummary) {
  const price = summary?.price_per_gram_paisa ?? null;

  return {
    label: productLabel(product),
    lowerLabel: productLowerLabel(product),
    balance: summary ? formatGrams(summary.balance_grams) : "—",
    value: summary ? formatRupees(summary.value_paisa) : "—",
    wallet: summary ? formatRupees(summary.balance_paisa) : "—",
    price: price !== null ? `${formatRupees(price)} / g` : "—",
  };
}
