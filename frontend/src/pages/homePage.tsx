import { Link } from "react-router-dom";
import { AppHeader } from "@/features/app/components/appHeader";
import { getApiErrorMessage } from "@/features/app/apiError";
import { useAppSelector } from "@/features/app/store";
import { DashboardError } from "@/features/home/components/dashboardError";
import { DashboardStats } from "@/features/home/components/dashboardStats";
import { HomeHero } from "@/features/home/components/homeHero";
import { HowItWorks } from "@/features/home/components/howItWorks";
import { RecentPurchases } from "@/features/home/components/recentPurchases";
import { RecentWalletActivity } from "@/features/home/components/recentWalletActivity";
import { selectProduct } from "@/features/product/productSlice";
import { useVaultSummaryQuery } from "@/features/vault/vaultApi";
import { useWalletTransactionsQuery } from "@/features/wallet/walletApi";

export function HomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const product = useAppSelector(selectProduct);
  const { data, isLoading, isError, error, refetch } =
    useVaultSummaryQuery(product);
  const {
    data: walletTransactions,
    isLoading: isLoadingWallet,
    isError: isWalletError,
    refetch: refetchWallet,
  } = useWalletTransactionsQuery({ limit: 5 });

  const errorDetail = isError
    ? getApiErrorMessage(error, "Could not load your dashboard.")
    : undefined;

  return (
    <div className="min-h-screen">
      <AppHeader>
        <Link
          to="/vault"
          className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
        >
          {product === "GOLD" ? "Gold vault" : "Silver vault"}
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <HomeHero product={product} username={user?.username} />

        {isError && errorDetail && (
          <DashboardError detail={errorDetail} onRetry={() => refetch()} />
        )}

        <DashboardStats
          product={product}
          summary={data}
          isLoading={isLoading}
          isError={isError}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <RecentPurchases
            product={product}
            collections={data?.collections}
            isLoading={isLoading}
            isError={isError}
          />
          <RecentWalletActivity
            transactions={walletTransactions}
            isLoading={isLoadingWallet}
            isError={isWalletError}
            onRetry={() => refetchWallet()}
          />
        </div>

        <HowItWorks product={product} />
      </main>
    </div>
  );
}
