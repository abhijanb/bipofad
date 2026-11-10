import { useAppDispatch, useAppSelector } from "@/features/app/store";
import type { VaultProduct } from "@/features/vault/types";
import { productLabel, productLowerLabel } from "../product";
import {
  selectProduct,
  setProduct as setProductAction,
} from "../productSlice";

/** The currently selected metal, its labels, and a setter. */
export function useProduct() {
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectProduct);

  function setProduct(next: VaultProduct) {
    dispatch(setProductAction(next));
  }

  return {
    product,
    setProduct,
    label: productLabel(product),
    lowerLabel: productLowerLabel(product),
  };
}
