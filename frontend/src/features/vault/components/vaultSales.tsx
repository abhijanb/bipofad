import { Banknote } from "lucide-react";
import { formatDateTime, formatGrams, formatRupees } from "../format";
import type { VaultProduct, VaultSale } from "../types";
import { useVaultSales } from "../hooks/useVaultSales";

export function VaultSales({
  product,
  sales,
  isLoading,
}: {
  product: VaultProduct;
  sales?: VaultSale[];
  isLoading: boolean;
}) {
  const {
    sales: items,
    isLoading: loading,
    lowerLabel,
  } = useVaultSales({ product, sales, isLoading });

  return (
    <section className="card mt-6 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">History</p>
          <h2 className="section-heading mt-2">Cash-outs</h2>
        </div>
        {items && items.length > 0 && (
          <span className="chip">{items.length} entries</span>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-silver-500">Loading cash-outs...</p>
      ) : items && items.length > 0 ? (
        <ul className="mt-4 divide-y divide-ink-900/5">
          {items.map((sale) => (
            <li key={sale.id} className="list-row rounded-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <Banknote className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-950">
                    {formatGrams(sale.grams)} of {lowerLabel}
                  </p>
                  <p className="truncate text-xs text-silver-500">
                    {formatRupees(sale.amount_paisa)} at{" "}
                    {formatRupees(sale.price_per_gram_paisa)} / g
                  </p>
                  <p className="mt-0.5 text-xs text-silver-400">
                    {formatDateTime(sale.sold_at)}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold text-emerald-600">
                +{formatRupees(sale.amount_paisa)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state mt-4">No cash-outs yet.</p>
      )}
    </section>
  );
}
