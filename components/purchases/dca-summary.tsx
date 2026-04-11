"use client";

import type { Purchase } from "@/lib/types";
import { calculateDca, formatAmount, formatRate } from "@/lib/utils/dca";

type Props = {
  purchases: Purchase[];
  homeCurrency: string;
  targetCurrency: string;
};

export function DcaSummary({ purchases, homeCurrency, targetCurrency }: Props) {
  const stats = calculateDca(purchases);
  const hasFees = stats.totalFees > 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Total Spent */}
      <div className="rounded-xl border border-border bg-card px-4 py-4">
        <p className="text-xs font-medium text-muted">Total Spent</p>
        <p className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
          {formatAmount(stats.totalCost, homeCurrency)}
        </p>
        {hasFees ? (
          <p className="mt-0.5 text-xs text-muted">
            {homeCurrency}{" "}
            <span className="text-amber-400/80">
              incl. {formatAmount(stats.totalFees, homeCurrency)} fees
            </span>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-muted">{homeCurrency}</p>
        )}
      </div>

      {/* Total Received */}
      <div className="rounded-xl border border-border bg-card px-4 py-4">
        <p className="text-xs font-medium text-muted">Total Received</p>
        <p className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
          {formatAmount(stats.totalForeign, targetCurrency)}
        </p>
        <p className="mt-0.5 text-xs text-muted">{targetCurrency}</p>
      </div>

      {/* Blended Rate */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-4">
        <p className="text-xs font-medium text-accent">
          {hasFees ? "True Rate" : "Blended Rate"}
        </p>
        <p className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
          {formatRate(stats.trueRate)}
        </p>
        {hasFees ? (
          <p className="mt-0.5 text-xs text-muted">
            {targetCurrency}/{homeCurrency}{" "}
            <span className="text-foreground/40">
              nom. {formatRate(stats.nominalRate)}
            </span>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-muted">
            {targetCurrency}/{homeCurrency}
          </p>
        )}
      </div>
    </div>
  );
}
