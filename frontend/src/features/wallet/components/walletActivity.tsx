import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  formatDateTime,
  formatRupees,
  formatSignedRupees,
} from "@/features/vault/format";
import type { WalletTransaction } from "../types";
import { useWalletActivity } from "../hooks/useWalletActivity";

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
  const {
    rows,
    isLoading: loading,
    isError: hasError,
    onRetry: retry,
  } = useWalletActivity({ transactions, isLoading, isError, onRetry });

  return (
    <section className="card mt-6 p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Ledger</p>
          <h2 className="section-heading mt-2">Wallet activity</h2>
          <p className="mt-1 text-sm text-silver-500">
            Money added to and spent from your wallet.
          </p>
        </div>
        {rows.length > 0 && <span className="chip">{rows.length} entries</span>}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-silver-500">Loading wallet activity...</p>
      ) : hasError ? (
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Could not load wallet activity.
          </p>
          <button
            type="button"
            onClick={retry}
            className="btn btn-ghost w-fit px-3 py-1.5 text-xs"
          >
            Try again
          </button>
        </div>
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
                  {transaction.description && (
                    <p className="truncate text-xs text-silver-500">
                      {transaction.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-silver-400">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={`text-sm font-semibold ${
                    transaction.isCredit ? "text-emerald-600" : "text-ink-900"
                  }`}
                >
                  {formatSignedRupees(transaction.amount_paisa)}
                </p>
                <p className="mt-0.5 text-xs text-silver-500">
                  Balance {formatRupees(transaction.balance_after_paisa)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state mt-4">No wallet activity yet.</p>
      )}
    </section>
  );
}
