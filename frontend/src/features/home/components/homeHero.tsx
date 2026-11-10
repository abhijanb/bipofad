import { Link } from "react-router-dom";
import type { VaultProduct, VaultSummary } from "@/features/vault/types";
import { useHomeHero } from "../hooks/useHomeHero";

export function HomeHero({
  product,
  username,
  summary,
}: {
  product: VaultProduct;
  username?: string;
  summary?: VaultSummary;
}) {
  const { label, lowerLabel, balance, value, wallet, price } = useHomeHero(
    product,
    summary,
  );

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-ink-950 p-6 text-cream-50 shadow-soft sm:p-10">
      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-silver-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-300">
            Welcome back{username ? `, ${username}` : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            Small steps.
            <span className="block text-gold-300">Real metal.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-cream-200/70 sm:text-base">
            Save a little at a time, own fractional {lowerLabel}, and build your
            vault from Rs 10.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/vault" className="btn btn-gold">
              Buy {lowerLabel}
            </Link>
            <Link
              to="/vault"
              className="btn border border-white/15 bg-white/5 text-cream-50 hover:bg-white/10"
            >
              Open {label} vault
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-[2rem] border border-white/10" />
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-silver-400">
                Your {lowerLabel} vault
              </p>
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cream-100">
                {label}
              </span>
            </div>

            <p className="mt-4 font-display text-3xl font-semibold tracking-tight">
              {balance}
            </p>
            <p className="mt-1 text-sm text-cream-200/60">
              Current value {value}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <MiniStat label="Wallet" value={wallet} />
              <MiniStat label="Price / g" value={price} />
              <MiniStat label="Metal" value={label} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[0.6rem] uppercase tracking-[0.14em] text-silver-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-cream-100">
        {value}
      </p>
    </div>
  );
}
