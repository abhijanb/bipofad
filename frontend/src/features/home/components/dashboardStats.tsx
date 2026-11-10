import { Coins, TrendingUp, Wallet } from "lucide-react";
import type { VaultProduct, VaultSummary } from "@/features/vault/types";
import { useDashboardStats } from "../hooks/useDashboardStats";

const ICONS = [
  <Wallet key="wallet" className="h-5 w-5" aria-hidden="true" />,
  <Coins key="coins" className="h-5 w-5" aria-hidden="true" />,
  <TrendingUp key="trending" className="h-5 w-5" aria-hidden="true" />,
];

const TONES = [
  "bg-gold-100 text-gold-600",
  "bg-silver-200 text-ink-700",
  "bg-ink-950 text-gold-300",
];

export function DashboardStats({
  product,
  summary,
  isLoading,
  isError,
}: {
  product: VaultProduct;
  summary?: VaultSummary;
  isLoading: boolean;
  isError: boolean;
}) {
  const { stats } = useDashboardStats({
    product,
    summary,
    isLoading,
    isError,
  });

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          icon={ICONS[index]}
          tone={TONES[index] ?? TONES[0]!}
          label={stat.label}
          value={stat.value}
          hint={stat.hint}
        />
      ))}
    </section>
  );
}

function StatCard({
  icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-silver-500">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-silver-500">{hint}</p>
    </div>
  );
}
