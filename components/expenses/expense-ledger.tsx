"use client";

import { ExpenseTeaser } from "./expense-teaser";
import { formatAmount } from "@/lib/utils/dca";
import type { Expense } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// -- Props -------------------------------------------------------------------

type Props = {
  expenses: Expense[];
  loading: boolean;
  trueRate: number;
  homeCurrency: string;
  targetCurrency: string;
  isGuest: boolean;
  onDelete: (id: string) => void;
};

// -- Component ---------------------------------------------------------------

export function ExpenseLedger({
  expenses,
  loading,
  trueRate,
  homeCurrency,
  targetCurrency,
  isGuest,
  onDelete,
}: Props) {
  if (isGuest) {
    return <ExpenseTeaser />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <svg
          className="h-5 w-5 animate-spin text-muted"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-border py-12 text-center">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
          No expenses logged
        </p>
        <p className="mt-2 font-serif italic text-sm text-muted">
          Start tracking what you spend on your trip.
        </p>
      </div>
    );
  }

  const totalForeign = expenses.reduce((s, e) => s + e.amount_foreign, 0);
  const totalHome = trueRate > 0 ? totalForeign / trueRate : 0;

  // Grid template: DATE | CATEGORY | NOTE | AMOUNT | DELETE
  const cols =
    "grid-cols-[4.5rem_6rem_1fr_auto_1.5rem] sm:grid-cols-[5rem_7rem_1fr_auto_2rem]";

  return (
    <div className="border border-foreground/80 bg-card">
      {/* Header — desktop only */}
      <div
        className={`hidden sm:grid ${cols} items-center gap-3 border-b-[1.5px] border-foreground bg-foreground/[0.03] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted`}
      >
        <span>Date</span>
        <span>Category</span>
        <span>Note</span>
        <span className="text-right">Amount</span>
        <span />
      </div>

      {/* Rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {expenses.map((exp) => {
          const trueCost = trueRate > 0 ? exp.amount_foreign / trueRate : 0;
          return (
            <div
              key={exp.id}
              className={`group grid ${cols} items-start gap-2 sm:gap-3 border-b border-border px-3 py-3.5 sm:px-4 last:border-b-0`}
            >
              <span className="font-mono text-[11px] text-muted whitespace-nowrap">
                {formatDate(exp.created_at)}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-stamp">
                {exp.category}
              </span>
              <span className="font-serif text-sm text-foreground break-words min-w-0">
                {exp.notes ?? <span className="text-muted">—</span>}
              </span>
              <div className="text-right">
                <p className="font-mono text-[13px] tabular-nums text-foreground whitespace-nowrap">
                  {formatAmount(exp.amount_foreign, targetCurrency)}
                  <span className="ml-1.5 text-[10px] text-muted">
                    {targetCurrency}
                  </span>
                </p>
                {trueRate > 0 && (
                  <p className="mt-0.5 font-mono text-[11px] tabular-nums text-stamp whitespace-nowrap">
                    &asymp; {formatAmount(trueCost, homeCurrency)}{" "}
                    {homeCurrency}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this expense? This cannot be undone.")) {
                    onDelete(exp.id);
                  }
                }}
                className="mt-0.5 shrink-0 p-1 text-muted/60 transition-colors hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Delete expense"
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
          );
        })}
      </div>

      {/* Totals row inside the bordered wrapper */}
      <div className="flex justify-end gap-6 px-5 py-3 border-t-[1.5px] border-foreground font-mono text-[11px] text-foreground/70">
        <span>
          Total:{" "}
          <span className="text-foreground tabular-nums">
            {formatAmount(totalForeign, targetCurrency)} {targetCurrency}
          </span>
        </span>
        {trueRate > 0 && (
          <span>
            &asymp;{" "}
            <span className="text-stamp tabular-nums">
              {formatAmount(totalHome, homeCurrency)} {homeCurrency}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
