import { formatRupees } from "@/features/vault/format";
import type { VaultProduct } from "@/features/vault/types";
import { useLatestPriceQuery } from "@/features/vault/vaultApi";
import { PRODUCTS, productLabel } from "../product";
import { useProduct } from "./useProduct";

// Prices change rarely, so a cached value stays fresh for an hour. A hard
// refresh clears the in-memory RTK Query cache.
const PRICE_CACHE_SECONDS = 3600;

/** Select options with their current rate, plus the selected metal. */
export function useProductSwitcher() {
  const { product, setProduct } = useProduct();
  const silverPrice = useLatestPriceQuery("SILVER", {
    refetchOnMountOrArgChange: PRICE_CACHE_SECONDS,
  });
  const goldPrice = useLatestPriceQuery("GOLD", {
    refetchOnMountOrArgChange: PRICE_CACHE_SECONDS,
  });

  const options = PRODUCTS.map((value) => {
    const query = value === "GOLD" ? goldPrice : silverPrice;

    return {
      value,
      label: productLabel(value),
      price: query.data
        ? `${formatRupees(query.data.price_per_gram_paisa)} / g`
        : query.isFetching
          ? "Loading price…"
          : null,
    };
  });

  return {
    product,
    setProduct: (next: VaultProduct) => setProduct(next),
    options,
  };
}
