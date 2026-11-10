import type { VaultCollection, VaultProduct } from "@/features/vault/types";
import { productLowerLabel } from "@/features/product/product";

type Params = {
  product: VaultProduct;
  collections?: VaultCollection[];
  isLoading: boolean;
  isError: boolean;
};

/** The three most recent collections for the dashboard list. */
export function useRecentPurchases({
  product,
  collections,
  isLoading,
  isError,
}: Params) {
  return {
    recentCollections: collections?.slice(0, 3) ?? [],
    lowerLabel: productLowerLabel(product),
    isLoading,
    isError,
  };
}
