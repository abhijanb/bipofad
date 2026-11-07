import { formatDateTime, formatGrams, formatRupees } from "../format";
import { productLowerLabel } from "@/features/product/product";
import type { VaultProduct, VaultSale } from "../types";

export function VaultSales({
  product,
  sales,
  isLoading,
}: {
  product: VaultProduct;
  sales?: VaultSale[];
  isLoading: boolean;
}) {
  const lowerLabel = productLowerLabel(product);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">Cash-outs</h2>
      <p className="mt-1 text-sm text-gray-500">
        {product === "GOLD" ? "Gold" : "Silver"} you sold back to your wallet.
      </p>

      {isLoading ? (
        <p className="mt-3 text-sm text-gray-500">Loading cash-outs...</p>
      ) : sales && sales.length > 0 ? (
        <ul className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {sales.map((sale) => (
            <li
              key={sale.id}
              className="flex items-start justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {formatGrams(sale.grams)} of {lowerLabel}
                </p>
                <p className="truncate text-xs text-gray-600">
                  {formatRupees(sale.amount_paisa)} at{" "}
                  {formatRupees(sale.price_per_gram_paisa)} / g
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatDateTime(sale.sold_at)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium text-emerald-600">
                +{formatRupees(sale.amount_paisa)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No cash-outs yet.
        </p>
      )}
    </section>
  );
}
