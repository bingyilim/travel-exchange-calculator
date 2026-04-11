import type { Purchase } from "@/lib/types";

export type DcaStats = {
  totalHome: number;
  totalForeign: number;
  totalFees: number;
  /** home + fees — the true total outlay */
  totalCost: number;
  /** SUM(foreign) / SUM(home) — exchange rate ignoring fees */
  nominalRate: number;
  /** SUM(foreign) / (SUM(home) + SUM(fees)) — effective rate after fees */
  trueRate: number;
  purchaseCount: number;
};

export function calculateDca(purchases: Purchase[]): DcaStats {
  const zero: DcaStats = {
    totalHome: 0,
    totalForeign: 0,
    totalFees: 0,
    totalCost: 0,
    nominalRate: 0,
    trueRate: 0,
    purchaseCount: 0,
  };

  if (purchases.length === 0) return zero;

  const totalHome = purchases.reduce((sum, p) => sum + p.home_amount, 0);
  const totalForeign = purchases.reduce((sum, p) => sum + p.foreign_amount, 0);
  const totalFees = purchases.reduce((sum, p) => sum + (p.fee_amount ?? 0), 0);
  const totalCost = totalHome + totalFees;

  return {
    totalHome,
    totalForeign,
    totalFees,
    totalCost,
    nominalRate: totalHome > 0 ? totalForeign / totalHome : 0,
    trueRate: totalCost > 0 ? totalForeign / totalCost : 0,
    purchaseCount: purchases.length,
  };
}

// -- Formatting helpers ------------------------------------------------------

const ZERO_DECIMAL_CURRENCIES = new Set([
  "JPY",
  "KRW",
  "VND",
  "IDR",
  "HUF",
]);

/** Format a currency amount with locale-appropriate grouping. */
export function formatAmount(amount: number, currency: string): string {
  const decimals = ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format an exchange rate with enough precision to be meaningful.
 * Rates >= 1 get 4 decimals; rates < 1 get 6.
 */
export function formatRate(rate: number): string {
  if (rate === 0) return "—";
  const decimals = rate >= 1 ? 4 : 6;
  return rate.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}
