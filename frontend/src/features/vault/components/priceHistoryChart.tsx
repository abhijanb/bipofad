import { formatDate, formatRupees } from "../format";
import type { PricePoint, VaultProduct } from "../types";
import { usePriceHistoryChart } from "../hooks/usePriceHistoryChart";

export function PriceHistoryChart({
  product,
  points,
  isLoading,
  isError,
}: {
  product: VaultProduct;
  points?: PricePoint[];
  isLoading: boolean;
  isError: boolean;
}) {
  const {
    latest,
    chart,
    label,
    lowerLabel,
    isLoading: loading,
    isError: hasError,
    pointCount,
    width,
    height,
    padding,
  } = usePriceHistoryChart({ product, points, isLoading, isError });

  const accent = product === "GOLD" ? "#cfa33f" : "#8793a3";
  const fillId = `priceFill-${product}`;

  return (
    <section className="card mt-6 p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Market</p>
          <h2 className="section-heading mt-2">{label} price history</h2>
          <p className="mt-1 text-sm text-silver-500">
            The rate used for new collections.
          </p>
        </div>
        {latest && (
          <div className="rounded-2xl border border-ink-900/10 bg-cream-50/70 px-4 py-3 text-right">
            <p className="font-display text-xl font-semibold text-ink-950">
              {formatRupees(latest.price_per_gram_paisa)}
              <span className="font-sans text-xs font-normal text-silver-500">
                {" "}
                / g
              </span>
            </p>
            <p className="text-xs text-silver-500">
              {formatDate(latest.recorded_at)}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-silver-500">Loading price history...</p>
      ) : hasError ? (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load price history.
        </p>
      ) : !chart ? (
        <p className="empty-state mt-5">
          No {lowerLabel} price has been recorded yet.
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="mt-4 h-44 w-full"
            role="img"
            aria-label={`${label} price over time`}
          >
            <title>{label} price over time</title>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.24" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((fraction) => {
              const y = padding.top + fraction * chart.innerHeight;
              return (
                <line
                  key={fraction}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#ece3d3"
                  strokeWidth="1"
                />
              );
            })}

            {chart.area && (
              <path d={chart.area} fill={`url(#${fillId})`} stroke="none" />
            )}
            <path
              d={chart.line}
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={chart.last.x}
              cy={chart.last.y}
              r="4"
              fill={accent}
              stroke="#fcfaf6"
              strokeWidth="2"
            />
          </svg>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-silver-500">
            <span className="chip">Low {formatRupees(chart.min)}</span>
            <span>
              {pointCount} update{pointCount === 1 ? "" : "s"}
            </span>
            <span className="chip">High {formatRupees(chart.max)}</span>
          </div>
        </>
      )}
    </section>
  );
}
