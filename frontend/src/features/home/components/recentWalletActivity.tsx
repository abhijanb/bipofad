import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatDateTime, formatSignedRupees } from "@/features/vault/format";
import type { WalletTransaction } from "@/features/wallet/types";
import { useRecentWalletActivity } from "@/features/wallet/hooks/useRecentWalletActivity";

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
  const {
    rows,
    isLoading: loading,
    isError: hasError,
    onRetry: retry,
  } = useRecentWalletActivity({ transactions, isLoading, isError, onRetry });

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="section-heading text-lg">Wallet activity</h2>
          <p className="mt-1 text-sm text-silver-500">
            Money in and out of your wallet.
          </p>
        </div>
        {hasError && (
          <button
            type="button"
            onClick={retry}
            className="text-sm font-semibold text-ink-700 transition hover:text-ink-950"
          >
            Retry
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-silver-500">Loading wallet activity...</p>
      ) : hasError ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load wallet activity.
        </p>
      ) : rows.length > 0 ? (
        <ul className="mt-4 divide-y divide-ink-900/5">
          {rows.map((transaction) => (
            <li key={transaction.id} className="list-row rounded-xl">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full ${
                    transaction.isCredit
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-silver-200 text-ink-700"
                  }`}
                >
                  {transaction.isCredit ? (
                    <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-950">
                    {transaction.label}
                  </p>
                  <p className="text-xs text-silver-500">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>
              </div>
              <p
                className={`shrink-0 text-sm font-semibold ${
                  transaction.isCredit ? "text-emerald-600" : "text-ink-900"
                }`}
              >
                {formatSignedRupees(transaction.amount_paisa)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state mt-4">No wallet activity yet.</p>
      )}
    </section>
  );
}
