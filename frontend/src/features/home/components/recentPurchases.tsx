import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import { formatDate, formatGrams, formatRupees } from "@/features/vault/format";
import type { VaultCollection, VaultProduct } from "@/features/vault/types";
import { useRecentPurchases } from "../hooks/useRecentPurchases";

export function RecentPurchases({
  product,
  collections,
  isLoading,
  isError,
}: {
  product: VaultProduct;
  collections?: VaultCollection[];
  isLoading: boolean;
  isError: boolean;
}) {
  const {
    recentCollections,
    lowerLabel,
    isLoading: loading,
    isError: hasError,
  } = useRecentPurchases({ product, collections, isLoading, isError });

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="section-heading text-lg">Recent purchases</h2>
          <p className="mt-1 text-sm text-silver-500">
            Latest {lowerLabel} added to your vault.
          </p>
        </div>
        <Link
          to="/vault"
          className="text-sm font-semibold text-ink-700 transition hover:text-ink-950"
        >
          View vault →
        </Link>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-silver-500">Loading purchases...</p>
      ) : hasError ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load purchases.
        </p>
      ) : recentCollections.length > 0 ? (
        <ul className="mt-4 divide-y divide-ink-900/5">
          {recentCollections.map((collection) => (
            <li key={collection.id} className="list-row rounded-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-100 text-gold-600">
                  <Coins className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-950">
                    {formatGrams(collection.grams)}
                  </p>
                  <p className="text-xs text-silver-500">
                    {formatDate(collection.collected_at)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-ink-700">
                {formatRupees(collection.amount_paisa)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state mt-4">
          No {lowerLabel} yet. Start with as little as Rs 10.
        </p>
      )}
    </section>
  );
}
