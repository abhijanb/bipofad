export type VaultProduct = "SILVER" | "GOLD";

export type VaultCollection = {
  id: number;
  amount_paisa: number;
  grams: number;
  price_per_gram_paisa: number;
  collected_at: string;
};

export type VaultSale = {
  id: number;
  grams: number;
  amount_paisa: number;
  price_per_gram_paisa: number;
  sold_at: string;
};

export type VaultSummary = {
  product: VaultProduct;
  balance_paisa: number;
  balance_grams: number;
  price_per_gram_paisa: number | null;
  price_updated_at: string | null;
  value_paisa: number;
  /** Smallest holding the user may cash out, in whole grams. */
  min_cashout_grams: number;
  currency: string;
  collections: VaultCollection[];
  sales: VaultSale[];
};

export type PricePoint = {
  price_per_gram_paisa: number;
  source: string | null;
  recorded_at: string;
};

export type SetPriceInput = {
  product: VaultProduct;
  price_per_gram_paisa: number;
  source?: string;
};

export type CollectMetalInput = {
  product: VaultProduct;
  amount_paisa: number;
  idempotency_key: string;
};

export type CollectMetalResponse = {
  message: string;
  collection: VaultCollection;
  balance_grams: number;
  balance_paisa: number;
};

export type SellMetalInput = {
  product: VaultProduct;
  grams: number;
  idempotency_key: string;
};

export type SellMetalResponse = {
  message: string;
  sale: VaultSale;
  balance_grams: number;
  balance_paisa: number;
};
