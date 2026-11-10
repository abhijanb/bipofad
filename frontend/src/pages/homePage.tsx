import { DashboardError } from "@/features/home/components/dashboardError";
import { DashboardStats } from "@/features/home/components/dashboardStats";
import { HomeHero } from "@/features/home/components/homeHero";
import { HowItWorks } from "@/features/home/components/howItWorks";
import { RecentPurchases } from "@/features/home/components/recentPurchases";
import { RecentWalletActivity } from "@/features/home/components/recentWalletActivity";
import { useHomePage } from "@/features/home/hooks/useHomePage";
import Navbar from "@/components/navbar";

export function HomePage() {
  const {
    user,
    product,
    summary,
    isLoading,
    isError,
    errorDetail,
    refetch,
    walletTransactions,
    isLoadingWallet,
    isWalletError,
    refetchWallet,
  } = useHomePage();

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-container">
        <HomeHero
          product={product}
          username={user?.username}
          summary={summary}
        />

        {isError && errorDetail && (
          <DashboardError detail={errorDetail} onRetry={() => refetch()} />
        )}

        <DashboardStats
          product={product}
          summary={summary}
          isLoading={isLoading}
          isError={isError}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RecentPurchases
            product={product}
            collections={summary?.collections}
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
