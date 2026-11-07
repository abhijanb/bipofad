export type VaultProduct = "SILVER" | "GOLD";

export type VaultCollection = {
  id: number;
  amount_paisa: number;
  /** Decimal string from the API, e.g. "1.234". */
  grams: string;
  price_per_gram_paisa: number;
  collected_at: string;
};

export type VaultSale = {
  id: number;
  /** Decimal string from the API, e.g. "1.234". */
  grams: string;
  amount_paisa: number;
  price_per_gram_paisa: number;
  sold_at: string;
};

export type VaultSummary = {
  product: VaultProduct;
  balance_paisa: number;
  /** Decimal string from the API, e.g. "1.234". */
  balance_grams: string;
  price_per_gram_paisa: number | null;
  price_updated_at: string | null;
  value_paisa: number;
  /** Smallest holding the user may cash out, as a decimal string. */
  min_cashout_grams: string;
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
  /** Decimal string from the API, e.g. "1.234". */
  balance_grams: string;
  balance_paisa: number;
};

export type SellMetalInput = {
  product: VaultProduct;
  /** Decimal string so milligram precision survives the request. */
  grams: string;
  idempotency_key: string;
};

export type SellMetalResponse = {
  message: string;
  sale: VaultSale;
  /** Decimal string from the API, e.g. "1.234". */
  balance_grams: string;
  balance_paisa: number;
};
