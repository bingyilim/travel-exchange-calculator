"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatAmount } from "@/lib/utils/dca";
import type { Expense } from "@/lib/types";

// Category color palette (hex for recharts, matches Tailwind badge classes)
const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f59e0b",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Accommodation: "#8b5cf6",
  Other: "#6b7280",
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

// -- Custom tooltip ----------------------------------------------------------

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
    <div className="rounded-lg border border-border/50 bg-card/80 px-3 py-2 shadow-lg backdrop-blur-md">
      <p className="text-sm font-medium text-foreground">{data.name}</p>
      <p className="mt-0.5 tabular-nums text-xs text-muted">
        {formatAmount(data.value, currency)} {currency} ({pct.toFixed(1)}%)
      </p>
    </div>
  );
}

// -- Component ---------------------------------------------------------------

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

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-5">
      <h3 className="text-sm font-medium text-muted">Spending Breakdown</h3>

      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        {/* Chart — fixed min-height prevents collapse on tab switch */}
        <div
          className="h-44 w-44 shrink-0 [&_*]:outline-none"
          style={{ minHeight: 176 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
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

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {data.map((entry) => {
            const pct = total > 0 ? (entry.value / total) * 100 : 0;
            return (
              <div key={entry.name} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="flex-1 text-sm text-foreground">
                  {entry.name}
                </span>
                <span className="tabular-nums text-sm text-foreground">
                  {formatAmount(entry.value, targetCurrency)}
                </span>
                <span className="w-10 text-right tabular-nums text-xs text-muted">
                  {pct.toFixed(0)}%
                </span>
              </div>
            );
          })}

          {/* Total */}
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
