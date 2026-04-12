export interface PriceStats {
  median: number;
  min: number;
  max: number;
  count: number;
}

export function computePriceStats(prices: number[]): PriceStats | null {
  if (prices.length === 0) return null;

  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];

  return {
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    count: sorted.length,
  };
}
