import { useAppDispatch, useAppSelector } from "@/features/app/store";
import {
  PRODUCTS,
  productLabel,
} from "@/features/product/product";
import {
  selectProduct,
  setProduct,
} from "@/features/product/productSlice";
import type { VaultProduct } from "@/features/vault/types";

export function ProductSwitcher() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(selectProduct);

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Choose metal</span>
      <select
        value={selected}
        onChange={(event) =>
          dispatch(setProduct(event.target.value as VaultProduct))
        }
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 outline-none transition hover:bg-gray-50 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
        aria-label="Choose metal"
      >
        {PRODUCTS.map((product) => (
          <option key={product} value={product}>
            {productLabel(product)}
          </option>
        ))}
      </select>
    </label>
  );
}
