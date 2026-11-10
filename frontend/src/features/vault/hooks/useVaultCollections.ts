import { productLowerLabel } from "@/features/product/product";
import type { VaultCollection, VaultProduct } from "../types";

type Params = {
  product: VaultProduct;
  collections?: VaultCollection[];
  isLoading: boolean;
};

/** Label and data needed by the collections list. */
export function useVaultCollections({
  product,
  collections,
  isLoading,
}: Params) {
  return {
    collections,
    isLoading,
    lowerLabel: productLowerLabel(product),
  };
}
