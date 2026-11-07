import { Link } from "react-router-dom";
import { formatDate, formatGrams, formatRupees } from "@/features/vault/format";
import type { VaultCollection, VaultProduct } from "@/features/vault/types";
import { productLowerLabel } from "@/features/product/product";

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
  const recentCollections = collections?.slice(0, 3) ?? [];
  const lowerLabel = productLowerLabel(product);

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent {lowerLabel} purchases
        </h2>
        <Link
          to="/vault"
          className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          View vault
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-3 text-sm text-gray-500">Loading purchases...</p>
      ) : isError ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load purchases.
        </p>
      ) : recentCollections.length > 0 ? (
        <ul className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {recentCollections.map((collection) => (
            <li
              key={collection.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatGrams(collection.grams)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(collection.collected_at)}
                </p>
              </div>
              <p className="text-sm text-gray-700">
                {formatRupees(collection.amount_paisa)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No {lowerLabel} yet. Start with as little as Rs 10.
        </p>
      )}
    </section>
  );
}
