import { formatDate, formatRupees } from "../format";
import type { PricePoint, VaultProduct } from "../types";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 16, left: 16 };

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
  const latest = points && points.length > 0 ? points[points.length - 1] : null;
  const chart = points && points.length > 0 ? buildChart(points) : null;
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {label} price history
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            The rate used for new collections.
          </p>
        </div>
        {latest && (
          <div className="text-right">
            <p className="text-xl font-semibold text-gray-900">
              {formatRupees(latest.price_per_gram_paisa)}
              <span className="text-sm font-normal text-gray-500"> / g</span>
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(latest.recorded_at)}
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading price history...</p>
      ) : isError ? (
        <p className="mt-4 text-sm text-red-600">
          Could not load price history.
        </p>
      ) : !chart ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No {lowerLabel} price has been recorded yet.
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="mt-3 h-44 w-full"
            role="img"
            aria-label={`${label} price over time`}
          >
            <title>{label} price over time</title>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((fraction) => {
              const y = PADDING.top + fraction * chart.innerHeight;
              return (
                <line
                  key={fraction}
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })}

            {chart.area && (
              <path d={chart.area} fill="url(#priceFill)" stroke="none" />
            )}
            <path
              d={chart.line}
              fill="none"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={chart.last.x}
              cy={chart.last.y}
              r="3.5"
              fill="#111827"
            />
          </svg>

          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>Low {formatRupees(chart.min)}</span>
            <span>
              {points?.length} update{points?.length === 1 ? "" : "s"}
            </span>
            <span>High {formatRupees(chart.max)}</span>
          </div>
        </>
      )}
    </section>
  );
}

function buildChart(points: PricePoint[]) {
  const values = points.map((point) => point.price_per_gram_paisa);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const coords = points.map((point, index) => ({
    x:
      PADDING.left +
      (points.length === 1
        ? innerWidth / 2
        : (index / (points.length - 1)) * innerWidth),
    y:
      range === 0
        ? PADDING.top + innerHeight / 2
        : PADDING.top +
          (1 - (point.price_per_gram_paisa - min) / range) * innerHeight,
  }));

  const line = coords
    .map(
      (coord, index) =>
        `${index === 0 ? "M" : "L"}${coord.x.toFixed(1)},${coord.y.toFixed(1)}`,
    )
    .join(" ");

  const first = coords[0]!;
  const last = coords[coords.length - 1]!;
  const bottom = HEIGHT - PADDING.bottom;
  const area =
    coords.length > 1
      ? `${line} L${last.x.toFixed(1)},${bottom} L${first.x.toFixed(1)},${bottom} Z`
      : null;

  return { line, area, min, max, innerHeight, first, last };
}
