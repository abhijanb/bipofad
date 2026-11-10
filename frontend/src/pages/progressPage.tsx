import { Navbar } from "@/components/navbar";
import { GoalCard } from "@/features/goals/components/goalCard";
import { ProgressRing } from "@/features/goals/components/progressRing";
import { useProgressPage } from "@/features/goals/hooks/useProgressPage";
import { PRODUCTS } from "@/features/product/product";
import { formatRupees } from "@/features/vault/format";

export function ProgressPage() {
  const {
    isLoading,
    isError,
    showSummary,
    goalCount,
    completedCount,
    totalValuePaisa,
    averageProgress,
  } = useProgressPage();

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-container">
        <section className="card-dark relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-silver-400/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px]" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-300">
                Savings progress
              </p>
              <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-cream-50 sm:text-5xl">
                Every gram
                <span className="block text-gold-300">counts.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-cream-200/70">
                Set a target for each metal and watch it fill as you collect.
                Your goals update automatically after every purchase.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <SummaryStat
                  label="Goals"
                  value={showSummary ? `${goalCount}` : "—"}
                />
                <SummaryStat
                  label="Reached"
                  value={showSummary ? `${completedCount}` : "—"}
                />
                <SummaryStat
                  label="Saved value"
                  value={showSummary ? formatRupees(totalValuePaisa) : "—"}
                />
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ProgressRing
                value={averageProgress}
                caption={
                  isError
                    ? "Could not load"
                    : isLoading
                      ? "Loading"
                      : "Average progress"
                }
                placeholder={!showSummary}
              />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {PRODUCTS.map((product) => (
            <GoalCard key={product} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="truncate text-[0.6rem] uppercase tracking-[0.14em] text-silver-400">
        {label}
      </p>
      <p className="mt-1 truncate font-display text-lg font-semibold text-cream-50">
        {value}
      </p>
    </div>
  );
}
