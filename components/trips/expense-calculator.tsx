"use client";

import { useState } from "react";
import { formatAmount } from "@/lib/utils/dca";

type Props = {
  trueRate: number;
  homeCurrency: string;
  targetCurrency: string;
};

export function ExpenseCalculator({
  trueRate,
  homeCurrency,
  targetCurrency,
}: Props) {
  const [foreignPrice, setForeignPrice] = useState("");

  const priceNum = parseFloat(foreignPrice) || 0;
  const homeCost = trueRate > 0 ? priceNum / trueRate : 0;

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-5">
      <h3 className="text-sm font-medium text-muted">
        What does it cost me?
      </h3>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="number"
            min="0"
            step="any"
            value={foreignPrice}
            onChange={(e) => setForeignPrice(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-3 pr-14 text-lg tabular-nums text-foreground placeholder:text-muted/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">
            {targetCurrency}
          </span>
        </div>

        <svg
          className="h-5 w-5 shrink-0 text-muted/40"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>

        <div className="flex-1 rounded-lg bg-accent/5 py-2.5 text-center">
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {priceNum > 0 && trueRate > 0
              ? formatAmount(homeCost, homeCurrency)
              : "0"}
          </p>
          <p className="text-xs text-muted">{homeCurrency}</p>
        </div>
      </div>

      {trueRate === 0 && (
        <p className="mt-2 text-xs text-muted/50">
          Add purchases to calculate your blended rate.
        </p>
      )}
    </div>
  );
}
