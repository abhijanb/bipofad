import { Link } from "react-router-dom";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";
import type { VaultProduct } from "@/features/vault/types";

export function HomeHero({
  product,
  username,
}: {
  product: VaultProduct;
  username?: string;
}) {
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gray-900 p-8 text-white shadow-sm sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
          BIPOFAD
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome back, {username}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
          Save a little at a time, own fractional {lowerLabel}, and build your
          vault from Rs 10.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/vault"
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            Buy {lowerLabel}
          </Link>
          <Link
            to="/vault"
            className="rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open {label} vault
          </Link>
        </div>
      </div>
    </section>
  );
}
