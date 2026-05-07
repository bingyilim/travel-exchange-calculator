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
      <div className="flex flex-col items-center justify-center border border-dashed border-border py-12 text-center">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
          No purchases yet
        </p>
        <p className="mt-2 font-serif italic text-sm text-muted">
          Add your first exchange to start tracking your DCA rate.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-foreground/80 bg-card">
      {/* Header row */}
      <div className="sticky top-0 z-10 grid grid-cols-[4rem_1fr_1fr_5rem_2rem] items-center gap-2 border-b-[1.5px] border-foreground bg-foreground/[0.03] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
        <span>Date</span>
        <span className="text-right">Spent</span>
        <span className="text-right">Received</span>
        <span className="text-right">Rate</span>
        <span />
      </div>

      {/* Scrollable rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {purchases.map((p) => (
          <div
            key={p.id}
            className="group grid grid-cols-[4rem_1fr_1fr_5rem_2rem] items-start gap-2 border-b border-border px-4 py-3.5 last:border-b-0"
          >
            <div>
              <span className="font-mono text-[11px] text-muted">
                {formatDate(p.purchased_at)}
              </span>
              {p.notes && (
                <p className="mt-1 font-serif italic text-[11px] text-muted break-words">
                  {p.notes}
                </p>
              )}
            </div>
            <span className="text-right font-mono text-[13px] tabular-nums text-foreground">
              {formatAmount(p.home_amount, homeCurrency)}
              {p.fee_amount > 0 && (
                <span className="text-stamp">
                  {" "}+{formatAmount(p.fee_amount, homeCurrency)}
                </span>
              )}
              <span className="ml-1.5 text-[10px] text-muted">
                {homeCurrency}
              </span>
            </span>
            <span className="text-right font-mono text-[13px] tabular-nums text-foreground">
              {formatAmount(p.foreign_amount, targetCurrency)}
              <span className="ml-1.5 text-[10px] text-muted">
                {targetCurrency}
              </span>
            </span>
            <span className="text-right font-mono text-[13px] tabular-nums text-muted">
              {formatRate(p.exchange_rate)}
            </span>
            <button
              onClick={() => {
                if (confirm("Delete this purchase? This cannot be undone.")) {
                  onDelete(p.id);
                }
              }}
              className="ml-auto shrink-0 p-1 text-muted/60 transition-colors hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
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
