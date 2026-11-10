import type { ReactNode } from "react";
import { BrandMark } from "@/features/app/components/brandMark";

export function AuthPage({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950 px-4 py-8 text-cream-50 sm:py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-silver-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col lg:flex">
          <BrandMark inverted />
          <p className="eyebrow mt-10 text-gold-300">BIPOFAD</p>
          <h1 className="mt-4 max-w-lg font-display text-5xl leading-[1.05] tracking-tight text-cream-50">
            Own a little silver.
            <span className="block text-gold-300">Build a lot of future.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-cream-200/70">
            Start from Rs 10, collect fractional silver and gold, and watch your
            vault grow one small step at a time.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-cream-100">
              Start from Rs 10
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-cream-100">
              Live metal pricing
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-cream-100">
              Goal tracking
            </span>
          </div>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            <AuthStat value="10" label="Rupee start" />
            <AuthStat value="2" label="Metals" />
            <AuthStat value="100%" label="Your vault" />
          </div>
        </section>

        <section className="mx-auto w-full max-w-md lg:mx-0">
          <div className="mb-6 flex justify-center lg:hidden">
            <BrandMark inverted />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}

function AuthStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="font-display text-xl font-semibold text-cream-50">{value}</p>
      <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-silver-400">
        {label}
      </p>
    </div>
  );
}
