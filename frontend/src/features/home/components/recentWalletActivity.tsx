import { formatDateTime, formatSignedRupees } from "@/features/vault/format";
import { WALLET_TRANSACTION_LABELS } from "@/features/wallet/labels";
import type { WalletTransaction } from "@/features/wallet/types";

export function RecentWalletActivity({
  transactions,
  isLoading,
  isError,
  onRetry,
}: {
  transactions?: WalletTransaction[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const recentTransactions = transactions?.slice(0, 5) ?? [];

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent wallet activity
        </h2>
        {isError && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Retry
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="mt-3 text-sm text-gray-500">
          Loading wallet activity...
        </p>
      ) : isError ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load wallet activity.
        </p>
      ) : recentTransactions.length > 0 ? (
        <ul className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {recentTransactions.map((transaction) => {
            const isCredit = transaction.amount_paisa > 0;
            return (
              <li
                key={transaction.id}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {WALLET_TRANSACTION_LABELS[transaction.type] ??
                      transaction.type}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-medium ${
                    isCredit ? "text-emerald-600" : "text-gray-900"
                  }`}
                >
                  {formatSignedRupees(transaction.amount_paisa)}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No wallet activity yet.
        </p>
      )}
    </section>
  );
}
