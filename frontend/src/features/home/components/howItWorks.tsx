import { productLowerLabel } from "@/features/product/product";
import type { VaultProduct } from "@/features/vault/types";

export function HowItWorks({ product }: { product: VaultProduct }) {
  const lowerLabel = productLowerLabel(product);

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">How it works</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Step
          number="1"
          title="Start small"
          text="Begin with as little as Rs 10. No minimum savings goal."
        />
        <Step
          number="2"
          title={`Buy ${lowerLabel}`}
          text={`Every purchase adds fractional ${lowerLabel} to your vault.`}
        />
        <Step
          number="3"
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
    <div className="rounded-xl bg-gray-50 p-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
        {number}
      </span>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-gray-600">{text}</p>
    </div>
  );
}
