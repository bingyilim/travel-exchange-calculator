"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatAmount } from "@/lib/utils/dca";
import type { Expense } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f59e0b",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Accommodation: "#8b5cf6",
  Other: "#6366f1",
};

function getColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
}

type Props = {
  expenses: Expense[];
  targetCurrency: string;
};

type CategoryData = {
  name: string;
  value: number;
  color: string;
};

function ChartTooltip({
  active,
  payload,
  currency,
  total,
}: {
  active?: boolean;
  payload?: { payload: CategoryData }[];
  currency: string;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const pct = total > 0 ? (data.value / total) * 100 : 0;

  return (
    <div className="min-w-[160px] overflow-hidden rounded-2xl border border-white/20 bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-card/70 dark:shadow-black/40">
      {/* Color accent bar */}
      <div className="h-1" style={{ backgroundColor: data.color }} />
      <div className="px-4 py-3.5">
        <p className="text-sm font-semibold text-foreground">{data.name}</p>
        <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
          {formatAmount(data.value, currency)}{" "}
          <span className="text-sm font-normal text-muted">{currency}</span>
        </p>
        <div className="mt-2 flex items-center gap-2">
          {/* Mini progress bar */}
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, backgroundColor: data.color }}
            />
          </div>
          <span className="shrink-0 tabular-nums text-xs font-medium text-muted">
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function SpendingPieChart({ expenses, targetCurrency }: Props) {
  const data = useMemo<CategoryData[]>(() => {
    const grouped = new Map<string, number>();
    for (const e of expenses) {
      grouped.set(
        e.category,
        (grouped.get(e.category) ?? 0) + e.amount_foreign,
      );
    }
    return Array.from(grouped.entries())
      .map(([name, value]) => ({ name, value, color: getColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const total = data.reduce((s, d) => s + d.value, 0);

  const [hasInteracted, setHasInteracted] = useState(false);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card px-5 py-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-muted">Spending Breakdown</h3>
        {!hasInteracted && (
          <p className="text-xs text-muted/50">Tap a slice for details</p>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        {/* Chart */}
        <div
          className="h-52 w-52 shrink-0 [&_*]:outline-none"
          style={{ minHeight: 208 }}
          onMouseEnter={() => setHasInteracted(true)}
          onTouchStart={() => setHasInteracted(true)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={84}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                activeShape={undefined}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    cursor="default"
                    tabIndex={-1}
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip currency={targetCurrency} total={total} />
                }
                wrapperStyle={{ outline: "none" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend — filter out 0% categories */}
        <div className="flex-1 space-y-2.5">
          {data
            .filter((entry) => entry.value > 0)
            .map((entry) => {
              const pct = total > 0 ? (entry.value / total) * 100 : 0;
              return (
                <div key={entry.name} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {entry.name}
                  </span>
                  <span className="tabular-nums text-sm font-medium text-foreground">
                    {formatAmount(entry.value, targetCurrency)}
                  </span>
                  <span className="w-10 text-right tabular-nums text-xs text-muted">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}

          <div className="flex items-center gap-3 border-t border-border/50 pt-2.5">
            <span className="h-2.5 w-2.5 shrink-0" />
            <span className="flex-1 text-sm font-medium text-muted">
              Total
            </span>
            <span className="tabular-nums text-sm font-medium text-foreground">
              {formatAmount(total, targetCurrency)}
            </span>
            <span className="w-10 text-right text-xs text-muted">
              {targetCurrency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
