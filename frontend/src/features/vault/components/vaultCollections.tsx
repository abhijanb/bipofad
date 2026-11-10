import { Coins } from "lucide-react";
import { formatDate, formatGrams, formatRupees } from "../format";
import type { VaultCollection, VaultProduct } from "../types";
import { useVaultCollections } from "../hooks/useVaultCollections";

export function VaultCollections({
  product,
  collections,
  isLoading,
}: {
  product: VaultProduct;
  collections?: VaultCollection[];
  isLoading: boolean;
}) {
  const {
    collections: items,
    isLoading: loading,
    lowerLabel,
  } = useVaultCollections({ product, collections, isLoading });

  return (
    <section className="card mt-6 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">History</p>
          <h2 className="section-heading mt-2">Collections</h2>
        </div>
        {items && items.length > 0 && (
          <span className="chip">{items.length} entries</span>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-silver-500">Loading collections...</p>
      ) : items && items.length > 0 ? (
        <ul className="mt-4 divide-y divide-ink-900/5">
          {items.map((collection) => (
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
          No {lowerLabel} collected yet. Start with as little as Rs 10.
        </p>
      )}
    </section>
  );
}
