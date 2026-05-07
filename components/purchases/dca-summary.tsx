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

  let walletColor = "text-emerald-600 dark:text-emerald-400";
  let walletLabelColor = "text-emerald-600 dark:text-emerald-400";

  if (!hasPurchases) {
    walletColor = "text-foreground";
    walletLabelColor = "text-muted";
  } else if (isOverspent) {
    walletColor = "text-destructive";
    walletLabelColor = "text-destructive";
  } else if (isLow) {
    walletColor = "text-stamp";
    walletLabelColor = "text-stamp";
  }

  // Wallet display value and subtext
  let walletValue: string;
  let walletSubtext: React.ReactNode;

  if (!hasPurchases && !hasExpenses) {
    walletValue = "—";
    walletSubtext = "No purchases yet";
  } else if (!hasPurchases && hasExpenses) {
    walletValue = formatAmount(totalExpensesForeign, targetCurrency);
    walletSubtext = "spent · add a purchase to see balance";
  } else if (hasPurchases && hasExpenses && stats.trueRate > 0) {
    walletValue = formatAmount(remaining, targetCurrency);
    walletSubtext = (
      <>
        &asymp; {formatAmount(remainingHome, homeCurrency)} {homeCurrency}
      </>
    );
  } else {
    walletValue = formatAmount(remaining, targetCurrency);
    walletSubtext = targetCurrency;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 border border-foreground/80 bg-card">
      {/* Total Spent */}
      <div className="px-5 py-5 border-r border-border last:border-r-0 sm:[&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:sm:border-r border-b sm:border-b-0 sm:[&:nth-child(-n+2)]:border-b-0">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-muted mb-2.5">
          Total spent
        </p>
        <p className="font-serif text-3xl text-accent leading-none tabular-nums">
          {formatAmount(stats.totalCost, homeCurrency)}
        </p>
        <div className="mt-2 flex justify-between font-mono text-[10px] tracking-wide text-foreground/70">
          <span>{homeCurrency}</span>
          {hasFees && (
            <span className="text-stamp">
              incl. {formatAmount(stats.totalFees, homeCurrency)} fees
            </span>
          )}
        </div>
      </div>

      {/* Total Received */}
      <div className="px-5 py-5 border-r border-border last:border-r-0 border-b sm:border-b-0 sm:[&:nth-child(-n+2)]:border-b-0">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-muted mb-2.5">
          Total received
        </p>
        <p className="font-serif text-3xl text-accent leading-none tabular-nums">
          {formatAmount(stats.totalForeign, targetCurrency)}
        </p>
        <div className="mt-2 font-mono text-[10px] tracking-wide text-foreground/70">
          {targetCurrency}
        </div>
      </div>

      {/* True Rate (highlighted) */}
      <div className="px-5 py-5 border-r border-border last:border-r-0 bg-stamp/[0.04]">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-stamp mb-2.5">
          {hasFees ? "True rate" : "Blended rate"}
        </p>
        <p className="font-serif text-3xl text-accent leading-none tabular-nums">
          {formatRate(stats.trueRate)}
        </p>
        <div className="mt-2 flex justify-between font-mono text-[10px] tracking-wide text-foreground/70">
          <span>
            {targetCurrency}/{homeCurrency}
          </span>
          {hasFees && (
            <span className="text-muted">
              nom. {formatRate(stats.nominalRate)}
            </span>
          )}
        </div>
      </div>

      {/* Wallet */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 mb-2.5">
          <p
            className={`font-mono text-[9px] font-medium uppercase tracking-[0.22em] ${walletLabelColor}`}
          >
            Wallet
          </p>
          {isOverspent && (
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-destructive">
              · Overspent
            </span>
          )}
        </div>
        <p
          className={`font-serif text-3xl leading-none tabular-nums ${walletColor}`}
        >
          {walletValue}
        </p>
        <div className="mt-2 font-mono text-[10px] tracking-wide text-foreground/70">
          {walletSubtext}
        </div>
      </div>
    </div>
  );
}
