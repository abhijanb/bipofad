import { productLowerLabel } from "@/features/product/product";
import type { VaultProduct, VaultSale } from "../types";

type Params = {
  product: VaultProduct;
  sales?: VaultSale[];
  isLoading: boolean;
};

/** Label and data needed by the cash-outs list. */
export function useVaultSales({ product, sales, isLoading }: Params) {
  return {
    sales,
    isLoading,
    lowerLabel: productLowerLabel(product),
  };
}
