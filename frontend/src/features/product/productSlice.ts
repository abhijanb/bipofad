import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VaultProduct } from "@/features/vault/types";

const STORAGE_KEY = "hbc.product";

function loadProduct(): VaultProduct {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "GOLD"
      ? "GOLD"
      : "SILVER";
  } catch {
    return "SILVER";
  }
}

type ProductState = {
  selected: VaultProduct;
};

const initialState: ProductState = {
  selected: loadProduct(),
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProduct(state, action: PayloadAction<VaultProduct>) {
      state.selected = action.payload;
      try {
        window.localStorage.setItem(STORAGE_KEY, action.payload);
      } catch {
        // The in-memory selection still works if storage is unavailable.
      }
    },
  },
});

export const { setProduct } = productSlice.actions;
export const productReducer = productSlice.reducer;

type WithProduct = { product: ProductState };

export const selectProduct = (state: WithProduct) => state.product.selected;
