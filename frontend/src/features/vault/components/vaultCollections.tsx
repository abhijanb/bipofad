import { formatDate, formatGrams, formatRupees } from "../format";
import type { VaultCollection, VaultProduct } from "../types";
import { productLowerLabel } from "@/features/product/product";

export function VaultCollections({
  product,
  collections,
  isLoading,
}: {
  product: VaultProduct;
  collections?: VaultCollection[];
  isLoading: boolean;
}) {
  const lowerLabel = productLowerLabel(product);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">Collections</h2>

      {isLoading ? (
        <p className="mt-3 text-sm text-gray-500">Loading collections...</p>
      ) : collections && collections.length > 0 ? (
        <ul className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {collections.map((collection) => (
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
          No {lowerLabel} collected yet. Start with as little as Rs 10.
        </p>
      )}
    </section>
  );
}
