"use client";

import { useRef, useEffect, useState } from "react";
import { formatAmount } from "@/lib/utils/dca";

type Props = {
  trueRate: number;
  homeCurrency: string;
  targetCurrency: string;
  onLogExchange?: () => void;
};

export function ExpenseCalculator({
  trueRate,
  homeCurrency,
  targetCurrency,
  onLogExchange,
}: Props) {
  const [foreignPrice, setForeignPrice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const priceNum = parseFloat(foreignPrice) || 0;
  const homeCost = trueRate > 0 ? priceNum / trueRate : 0;
  const hasRate = trueRate > 0;
  const isTyping = priceNum > 0;
  const needsRate = isTyping && !hasRate;

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className={`rounded-xl border bg-card px-5 py-5 transition-colors ${
        needsRate ? "border-amber-500/40" : "border-border"
      }`}
    >
      <h3 className="text-sm font-medium text-muted">
        What does it cost me?
      </h3>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="number"
            min="0"
            step="any"
            value={foreignPrice}
            onChange={(e) => setForeignPrice(e.target.value)}
            placeholder="0"
            className={`w-full rounded-lg border bg-foreground/[0.02] py-3 pl-4 pr-14 text-lg tabular-nums text-foreground placeholder:text-muted/30 focus:outline-none focus:ring-1 transition-colors dark:bg-card ${
              needsRate
                ? "border-amber-500/40 focus:border-amber-500/50 focus:ring-amber-500/30"
                : "border-border focus:border-accent/50 focus:ring-accent/50"
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">
            {targetCurrency}
          </span>
        </div>

        <svg
          className="h-5 w-5 shrink-0 text-muted/40"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>

        <div className="flex-1 rounded-lg bg-accent/5 py-2.5 text-center">
          {needsRate ? (
            <button
              type="button"
              onClick={onLogExchange}
              className="group px-2"
            >
              <p className="text-sm font-medium text-amber-400">
                Log an exchange
              </p>
              <p className="mt-0.5 text-xs text-muted group-hover:text-foreground">
                to see true cost
              </p>
            </button>
          ) : (
            <>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {isTyping ? formatAmount(homeCost, homeCurrency) : "0"}
              </p>
              <p className="text-xs text-muted">{homeCurrency}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
