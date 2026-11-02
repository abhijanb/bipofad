export type VaultProduct = "SILVER";

export type VaultCollection = {
  id: number;
  amount_paisa: number;
  grams: number;
  price_per_gram_paisa: number;
  collected_at: string;
};

export type VaultSummary = {
  product: VaultProduct;
  balance_paisa: number;
  balance_grams: number;
  price_per_gram_paisa: number | null;
  value_paisa: number;
  currency: string;
  collections: VaultCollection[];
};

export type CollectSilverInput = {
  amount_paisa: number;
};

export type CollectSilverResponse = {
  message: string;
  collection: VaultCollection;
  balance_grams: number;
  balance_paisa: number;
};
