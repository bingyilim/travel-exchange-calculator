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

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="border border-foreground/80 bg-card px-6 sm:px-9 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-6 sm:gap-10 items-end">
        {/* LEFT — Foreign price */}
        <div className="w-full min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted mb-2">
            Foreign price
          </div>
          <div className="flex w-full items-end gap-3 h-14 border-b-[1.5px] border-foreground pb-1.5">
            <input
              ref={inputRef}
              type="number"
              min="0"
              step="any"
              value={foreignPrice}
              onChange={(e) => setForeignPrice(e.target.value)}
              placeholder="0"
              className="flex-1 min-w-0 bg-transparent border-none outline-none font-serif text-4xl sm:text-[42px] text-accent leading-none tracking-tight p-0"
              style={{ height: 50 }}
            />
            <span className="font-mono text-sm text-foreground/70 tracking-wider pb-1">
              {targetCurrency}
            </span>
          </div>
        </div>

        {/* MIDDLE — rate marker (its own column, no overlap) */}
        <div className="text-center pb-3 sm:px-2">
          {hasRate ? (
            <>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-stamp mb-1 whitespace-nowrap">
                @ {trueRate.toFixed(2)}
              </div>
              <div className="text-xl text-muted leading-none">→</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted mt-1 whitespace-nowrap">
                True rate
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={onLogExchange}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-stamp hover:text-foreground transition-colors text-center whitespace-nowrap"
            >
              Log exchange
              <br />
              to compute
            </button>
          )}
        </div>

        {/* RIGHT — Home cost */}
        <div className="w-full min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted mb-2">
            Home cost
          </div>
          <div className="flex w-full items-end gap-3 h-14 border-b-[1.5px] border-foreground pb-1.5">
            <span
              className={`flex-1 min-w-0 font-serif text-4xl sm:text-[42px] leading-none tracking-tight ${
                isTyping && hasRate ? "text-accent" : "text-muted"
              }`}
            >
              {isTyping && hasRate ? formatAmount(homeCost, homeCurrency) : "—"}
            </span>
            <span className="font-mono text-sm text-foreground/70 tracking-wider pb-1">
              {homeCurrency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
