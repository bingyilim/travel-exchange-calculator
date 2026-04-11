"use client";

import type { Purchase } from "@/lib/types";
import { formatAmount, formatRate } from "@/lib/utils/dca";

type Props = {
  purchases: Purchase[];
  homeCurrency: string;
  targetCurrency: string;
  onDelete: (id: string) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PurchaseList({
  purchases,
  homeCurrency,
  targetCurrency,
  onDelete,
}: Props) {
  if (purchases.length === 0) {
    return (
      <div className="flex max-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center sm:max-h-[400px]">
        <p className="text-sm font-medium text-foreground/70">
          No purchases yet
        </p>
        <p className="mt-1 text-sm text-muted">
          Add your first exchange to start tracking your DCA rate.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 grid grid-cols-[4rem_1fr_1fr_5rem_2rem] items-center gap-2 border-b border-border bg-card px-4 py-2.5 text-xs font-medium text-muted">
        <span>Date</span>
        <span className="text-right">Spent</span>
        <span className="text-right">Received</span>
        <span className="text-right">Rate</span>
        <span />
      </div>

      {/* Scrollable rows */}
      <div className="scrollbar-thin max-h-[300px] overflow-y-auto sm:max-h-[400px]">
        {purchases.map((p) => (
          <div
            key={p.id}
            className="group grid grid-cols-[4rem_1fr_1fr_5rem_2rem] items-start gap-2 border-b border-border/50 px-4 py-3 last:border-b-0 hover:bg-card"
          >
            <div>
              <span className="text-xs text-muted">
                {formatDate(p.purchased_at)}
              </span>
              {p.notes && (
                <p
                  className="mt-1 truncate text-xs text-muted/50"
                  title={p.notes}
                >
                  {p.notes}
                </p>
              )}
            </div>
            <span className="text-right text-sm tabular-nums text-foreground">
              {formatAmount(p.home_amount, homeCurrency)}
              {p.fee_amount > 0 && (
                <span className="text-amber-400/70">
                  {" "}+{formatAmount(p.fee_amount, homeCurrency)}
                </span>
              )}{" "}
              <span className="text-muted">{homeCurrency}</span>
            </span>
            <span className="text-right text-sm tabular-nums text-foreground">
              {formatAmount(p.foreign_amount, targetCurrency)}{" "}
              <span className="text-muted">{targetCurrency}</span>
            </span>
            <span className="text-right font-mono text-xs tabular-nums text-muted">
              {formatRate(p.exchange_rate)}
            </span>
            <button
              onClick={() => onDelete(p.id)}
              className="ml-auto shrink-0 rounded p-1 text-muted/30 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label="Delete purchase"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
