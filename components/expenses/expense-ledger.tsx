"use client";

import { useState } from "react";
import { AddExpenseModal } from "./add-expense-modal";
import { ExpenseTeaser } from "./expense-teaser";
import { formatAmount } from "@/lib/utils/dca";
import type { Expense } from "@/lib/types";

// -- Category styling --------------------------------------------------------

const CATEGORY_STYLES: Record<string, string> = {
  Food: "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400",
  Transport: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
  Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-500/10 dark:text-pink-400",
  Accommodation: "bg-violet-100 text-violet-800 dark:bg-violet-500/10 dark:text-violet-400",
  Other: "bg-slate-100 text-slate-700 dark:bg-indigo-500/10 dark:text-indigo-400",
};

function categoryClass(cat: string): string {
  return CATEGORY_STYLES[cat] ?? CATEGORY_STYLES.Other;
}

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
  tripId: string;
  trueRate: number;
  homeCurrency: string;
  targetCurrency: string;
  isGuest: boolean;
  onCreated: (expense: Expense) => void;
  onDelete: (id: string) => void;
};

// -- Component ---------------------------------------------------------------

export function ExpenseLedger({
  expenses,
  loading,
  tripId,
  trueRate,
  homeCurrency,
  targetCurrency,
  isGuest,
  onCreated,
  onDelete,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  // -- Guest teaser ----------------------------------------------------------
  if (isGuest) {
    return (
      <div>
        <h2 className="mb-4 text-sm font-medium text-muted">Expense Ledger</h2>
        <ExpenseTeaser />
      </div>
    );
  }

  // -- Authenticated ledger --------------------------------------------------
  const totalForeign = expenses.reduce((s, e) => s + e.amount_foreign, 0);
  const totalHome = trueRate > 0 ? totalForeign / trueRate : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">
          Expense Ledger
          {expenses.length > 0 && (
            <span className="ml-2 text-foreground/40">
              ({expenses.length})
            </span>
          )}
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-accent-glow transition-all hover:shadow-lg hover:shadow-accent-glow"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Record Spending
        </button>
      </div>

      {/* Loading */}
      {loading ? (
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
      ) : expenses.length === 0 ? (
        <div className="flex max-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center sm:max-h-[400px]">
          <p className="text-sm font-medium text-foreground/70">
            No expenses logged
          </p>
          <p className="mt-1 text-sm text-muted">
            Start tracking what you spend on your trip.
          </p>
        </div>
      ) : (
        <>
          <div className="scrollbar-thin max-h-[300px] overflow-y-auto rounded-xl border border-border/50 sm:max-h-[400px]">
            {expenses.map((exp) => {
              const trueCost =
                trueRate > 0 ? exp.amount_foreign / trueRate : 0;

              return (
                <div
                  key={exp.id}
                  className="group flex items-start gap-3 border-b border-border/30 bg-card px-4 py-3.5 last:border-b-0 hover:bg-card-hover/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${categoryClass(exp.category)}`}
                      >
                        {exp.category}
                      </span>
                      {exp.notes && (
                        <p
                          className="truncate text-sm text-foreground"
                          title={exp.notes}
                        >
                          {exp.notes}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(exp.created_at)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      {formatAmount(exp.amount_foreign, targetCurrency)}{" "}
                      <span className="text-muted">{targetCurrency}</span>
                    </p>
                    {trueRate > 0 && (
                      <p className="mt-0.5 text-xs tabular-nums text-accent">
                        &asymp; {formatAmount(trueCost, homeCurrency)}{" "}
                        {homeCurrency}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDelete(exp.id)}
                    className="mt-0.5 shrink-0 rounded p-1 text-muted/30 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
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

          {/* Totals */}
          <div className="mt-3 flex items-center justify-end gap-4 px-1 text-xs text-muted">
            <span>
              Total:{" "}
              <span className="tabular-nums text-foreground">
                {formatAmount(totalForeign, targetCurrency)} {targetCurrency}
              </span>
            </span>
            {trueRate > 0 && (
              <span>
                &asymp;{" "}
                <span className="tabular-nums text-accent">
                  {formatAmount(totalHome, homeCurrency)} {homeCurrency}
                </span>
              </span>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(expense) => {
          onCreated(expense);
          setModalOpen(false);
        }}
        tripId={tripId}
        targetCurrency={targetCurrency}
      />
    </div>
  );
}
