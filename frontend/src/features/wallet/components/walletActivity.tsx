import {
  formatDateTime,
  formatRupees,
  formatSignedRupees,
} from "@/features/vault/format";
import { WALLET_TRANSACTION_LABELS } from "../labels";
import type { WalletTransaction } from "../types";

export function WalletActivity({
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
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Wallet activity
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Money added to and spent from your wallet.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-3 text-sm text-gray-500">Loading wallet activity...</p>
      ) : isError ? (
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <p className="text-red-600">Could not load wallet activity.</p>
          <button
            type="button"
            onClick={onRetry}
            className="w-fit rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      ) : transactions && transactions.length > 0 ? (
        <ul className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {transactions.map((transaction) => {
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
                  {transaction.description && (
                    <p className="truncate text-xs text-gray-600">
                      {transaction.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-medium ${
                      isCredit ? "text-emerald-600" : "text-gray-900"
                    }`}
                  >
                    {formatSignedRupees(transaction.amount_paisa)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Balance {formatRupees(transaction.balance_after_paisa)}
                  </p>
                </div>
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
