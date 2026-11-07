import type { VaultProduct } from "@/features/vault/types";

/** The only two products in the catalog. */
export const PRODUCTS: VaultProduct[] = ["SILVER", "GOLD"];

export function productLabel(product: VaultProduct): string {
  return product === "GOLD" ? "Gold" : "Silver";
}

export function productLowerLabel(product: VaultProduct): string {
  return productLabel(product).toLowerCase();
}
