import { Link } from "react-router-dom";
import { Coins } from "lucide-react";

export function BrandMark({
  compact = false,
  inverted = false,
}: {
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span
        className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl shadow-soft ${
          inverted ? "bg-cream-50 text-ink-950" : "bg-ink-950 text-gold-300"
        }`}
      >
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
        <Coins className="relative h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="hidden flex-col leading-none sm:flex">
          <span
            className={`font-display text-lg font-semibold tracking-tight ${
              inverted ? "text-cream-50" : "text-ink-950"
            }`}
          >
            HBC
          </span>
          <span
            className={`mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] ${
              inverted ? "text-silver-400" : "text-silver-500"
            }`}
          >
            Metal savings
          </span>
        </span>
      )}
    </Link>
  );
}
