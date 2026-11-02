import { Link } from "react-router-dom";
import { AppHeader } from "@/features/app/components/appHeader";
import { CollectSilverForm } from "@/features/vault/components/collectSilverForm";
import { VaultBalanceCard } from "@/features/vault/components/vaultBalanceCard";
import { VaultCollections } from "@/features/vault/components/vaultCollections";
import { useVaultSummaryQuery } from "@/features/vault/vaultApi";
import { getApiErrorMessage } from "@/features/app/apiError";

export function VaultPage() {
  const { data, isLoading, isError, error, refetch } = useVaultSummaryQuery();
  const errorDetail = isError
    ? getApiErrorMessage(error, "Could not load your vault.")
    : undefined;

  return (
    <div className="min-h-screen">
      <AppHeader>
        <Link
          to="/"
          className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          Home
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-gray-900">Silver Vault</h1>
          <p className="text-gray-600">
            Collect a little silver at a time, starting from Rs 10.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <VaultBalanceCard
            summary={data}
            isLoading={isLoading}
            isError={isError}
            errorDetail={errorDetail}
            onRetry={() => refetch()}
          />
          <CollectSilverForm
            pricePerGramPaisa={data?.price_per_gram_paisa ?? null}
            balancePaisa={data?.balance_paisa ?? null}
            isLoadingPrice={isLoading}
          />
        </div>

        <VaultCollections
          collections={data?.collections}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
