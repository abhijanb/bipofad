import { useMemo } from "react";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";
import type { PricePoint, VaultProduct } from "../types";

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 16, left: 16 };

type Params = {
  product: VaultProduct;
  points?: PricePoint[];
  isLoading: boolean;
  isError: boolean;
};

export function usePriceHistoryChart({
  product,
  points,
  isLoading,
  isError,
}: Params) {
  const latest = points && points.length > 0 ? points[points.length - 1] : null;
  const chart = useMemo(
    () => (points && points.length > 0 ? buildChart(points) : null),
    [points],
  );
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  return {
    latest,
    chart,
    label,
    lowerLabel,
    isLoading,
    isError,
    pointCount: points?.length ?? 0,
    width: WIDTH,
    height: HEIGHT,
    padding: PADDING,
  };
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
