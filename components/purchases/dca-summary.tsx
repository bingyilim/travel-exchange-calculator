"use client";

import type { Purchase } from "@/lib/types";
import { calculateDca, formatAmount, formatRate } from "@/lib/utils/dca";

type Props = {
  purchases: Purchase[];
  homeCurrency: string;
  targetCurrency: string;
  totalExpensesForeign?: number;
};

export function DcaSummary({
  purchases,
  homeCurrency,
  targetCurrency,
  totalExpensesForeign = 0,
}: Props) {
  const stats = calculateDca(purchases);
  const hasFees = stats.totalFees > 0;

  const hasPurchases = stats.totalForeign > 0;
  const hasExpenses = totalExpensesForeign > 0;
  const remaining = stats.totalForeign - totalExpensesForeign;
  const remainingHome = stats.trueRate > 0 ? remaining / stats.trueRate : 0;

  // Wallet visual states
  const isOverspent = hasPurchases && remaining < 0;
  const isLow =
    hasPurchases && remaining >= 0 && remaining < stats.totalForeign * 0.1;

  let walletColor = "text-emerald-400";
  let walletBorder = "border-emerald-500/20 bg-emerald-500/5";
  let walletLabelColor = "text-emerald-400";

  if (!hasPurchases) {
    // No purchases: neutral card regardless of expenses
    walletColor = "text-foreground";
    walletBorder = "border-border bg-card";
    walletLabelColor = "text-muted";
  } else if (isOverspent) {
    walletColor = "text-destructive";
    walletBorder = "border-destructive/20 bg-destructive/5";
    walletLabelColor = "text-destructive";
  } else if (isLow) {
    walletColor = "text-amber-400";
    walletBorder = "border-amber-500/20 bg-amber-500/5";
    walletLabelColor = "text-amber-400";
  }

  // Wallet display value and subtext
  let walletValue: string;
  let walletSubtext: React.ReactNode;

  if (!hasPurchases && !hasExpenses) {
    // Empty state
    walletValue = "—";
    walletSubtext = "No purchases yet";
  } else if (!hasPurchases && hasExpenses) {
    // Expenses only, no purchases to calculate balance from
    walletValue = formatAmount(totalExpensesForeign, targetCurrency);
    walletSubtext = "spent · add a purchase to see balance";
  } else if (hasPurchases && hasExpenses && stats.trueRate > 0) {
    // Full data: show true value in home currency
    walletValue = formatAmount(remaining, targetCurrency);
    walletSubtext = (
      <>
        &asymp; {formatAmount(remainingHome, homeCurrency)} {homeCurrency}
      </>
    );
  } else {
    // Has purchases, no expenses (or no rate yet)
    walletValue = formatAmount(remaining, targetCurrency);
    walletSubtext = targetCurrency;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Total Spent */}
      <div className="rounded-xl border border-border/50 bg-card px-4 py-4">
        <p className="text-xs font-medium text-muted">Total Spent</p>
        <p className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
          {formatAmount(stats.totalCost, homeCurrency)}
        </p>
        {hasFees ? (
          <p className="mt-0.5 text-xs text-muted">
            {homeCurrency}{" "}
            <span className="text-rose-600 dark:text-amber-400">
              incl. {formatAmount(stats.totalFees, homeCurrency)} fees
            </span>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-muted">{homeCurrency}</p>
        )}
      </div>

      {/* Total Received */}
      <div className="rounded-xl border border-border/50 bg-card px-4 py-4">
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

      {/* Wallet */}
      <div
        className={`rounded-xl border px-4 py-4 transition-colors ${walletBorder}`}
      >
        <div className="flex items-center gap-2">
          <p className={`text-xs font-medium ${walletLabelColor}`}>Wallet</p>
          {isOverspent && (
            <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
              Overspent
            </span>
          )}
        </div>
        <p
          className={`mt-1.5 text-xl font-semibold tabular-nums transition-colors ${walletColor}`}
        >
          {walletValue}{" "}
          {walletValue !== "—" && (
            <span
              className={`text-sm font-normal ${hasPurchases ? walletColor : "text-muted"}`}
            >
              {targetCurrency}
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted">{walletSubtext}</p>
      </div>
    </div>
  );
}
