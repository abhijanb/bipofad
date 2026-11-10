import type { VaultProduct } from "@/features/vault/types";
import { useHowItWorks } from "../hooks/useHowItWorks";

export function HowItWorks({ product }: { product: VaultProduct }) {
  const { lowerLabel } = useHowItWorks(product);

  return (
    <section className="card mt-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Simple by design</p>
          <h2 className="section-heading mt-2">How it works</h2>
        </div>
        <p className="max-w-sm text-sm text-silver-500">
          Three small steps from your first rupee to a growing metal vault.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Step
          number="01"
          title="Start small"
          text="Begin with as little as Rs 10. No minimum savings goal."
        />
        <Step
          number="02"
          title={`Buy ${lowerLabel}`}
          text={`Every purchase adds fractional ${lowerLabel} to your vault.`}
        />
        <Step
          number="03"
          title="Track your vault"
          text={`Watch your ${lowerLabel} balance and full wallet ledger grow.`}
        />
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-2xl border border-ink-900/10 bg-cream-50/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 hover:bg-white hover:shadow-card">
      <span className="inline-flex rounded-full bg-ink-950 px-2.5 py-1 font-display text-xs font-semibold text-gold-300">
        {number}
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-silver-500">{text}</p>
    </div>
  );
}
