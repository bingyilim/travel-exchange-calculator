"use client";

import { useMemo } from "react";
import { formatAmount } from "@/lib/utils/dca";
import type { Expense } from "@/lib/types";

type Props = {
  expenses: Expense[];
  targetCurrency: string;
};

export function SpendingBars({ expenses, targetCurrency }: Props) {
  const data = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const e of expenses) {
      grouped.set(
        e.category,
        (grouped.get(e.category) ?? 0) + e.amount_foreign,
      );
    }
    return Array.from(grouped.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (data.length === 0) return null;

  return (
    <div className="border border-foreground/80 bg-card px-6 py-6 sm:px-8 sm:py-7">
      <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
        Spending by category
      </p>
      <div className="space-y-4">
        {data.map((d) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div
              key={d.name}
              className="grid grid-cols-[6rem_1fr_4rem_3rem] sm:grid-cols-[8rem_1fr_5rem_3.5rem] items-center gap-3 sm:gap-4"
            >
              <span className="font-serif text-base text-foreground truncate">
                {d.name}
              </span>
              <div className="h-2 w-full overflow-hidden bg-foreground/[0.06]">
                <div
                  className="h-full bg-accent transition-[width]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-right font-mono text-[12px] sm:text-[13px] tabular-nums text-foreground">
                {formatAmount(d.value, targetCurrency)}
              </span>
              <span className="text-right font-mono text-[11px] tabular-nums text-muted">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
