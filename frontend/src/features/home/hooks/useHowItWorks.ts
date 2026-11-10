import { productLowerLabel } from "@/features/product/product";
import type { VaultProduct } from "@/features/vault/types";

export function useHowItWorks(product: VaultProduct) {
  return {
    lowerLabel: productLowerLabel(product),
  };
}
