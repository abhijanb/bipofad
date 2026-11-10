import { useProductSwitcher } from "@/features/product/hooks/useProductSwitcher";

export function ProductSwitcher() {
  const { product, setProduct, options } = useProductSwitcher();

  return (
    <div
      className="flex rounded-full border border-ink-900/10 bg-white/70 p-0.5 shadow-sm"
      role="group"
      aria-label="Choose metal"
    >
      {options.map((option) => {
        const active = option.value === product;
        const tooltipId = `product-price-${option.value.toLowerCase()}`;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setProduct(option.value)}
            aria-pressed={active}
            aria-describedby={option.price ? tooltipId : undefined}
            className={`group relative rounded-full px-2 py-1.5 text-[0.7rem] font-semibold transition sm:px-3 sm:text-sm ${
              active
                ? option.value === "GOLD"
                  ? "bg-gradient-to-br from-gold-300 to-gold-500 text-ink-950 shadow-sm"
                  : "bg-ink-950 text-white shadow-sm"
                : "text-ink-600 hover:text-ink-950"
            }`}
          >
            {option.label}
            {option.price && (
              <span
                id={tooltipId}
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-ink-950 px-2.5 py-1 text-[0.65rem] font-medium text-cream-50 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {option.price}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
