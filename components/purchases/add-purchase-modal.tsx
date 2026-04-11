"use client";

import { useState } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import { formatAmount } from "@/lib/utils/dca";
import type { CreatePurchaseInput, Purchase } from "@/lib/types";

type FeeType = "inclusive" | "exclusive";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (purchase: Purchase) => void;
  tripId: string;
  homeCurrency: string;
  targetCurrency: string;
};

export function AddPurchaseModal({
  open,
  onClose,
  onCreated,
  tripId,
  homeCurrency,
  targetCurrency,
}: Props) {
  const { storage } = useStorage();

  const [homeAmount, setHomeAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeType, setFeeType] = useState<FeeType>("exclusive");
  const [purchasedAt, setPurchasedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const homeNum = parseFloat(homeAmount) || 0;
  const rateNum = parseFloat(exchangeRate) || 0;
  const feeNum = parseFloat(feeAmount) || 0;
  const hasFee = feeNum > 0;

  // Inclusive: fee is inside the entered amount → only (amount - fee) is exchanged
  // Exclusive: full amount is exchanged → fee is added on top
  const exchangedAmount =
    hasFee && feeType === "inclusive" ? homeNum - feeNum : homeNum;
  const foreignNum = exchangedAmount * rateNum;
  const totalOutOfPocket =
    hasFee && feeType === "exclusive" ? homeNum + feeNum : homeNum;

  function reset() {
    setHomeAmount("");
    setExchangeRate("");
    setFeeAmount("");
    setFeeType("exclusive");
    setPurchasedAt(new Date().toISOString().slice(0, 10));
    setNotes("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (homeNum <= 0 || rateNum <= 0) {
      setError("Amount and rate must be greater than zero.");
      return;
    }

    if (hasFee && feeType === "inclusive" && feeNum >= homeNum) {
      setError("Inclusive fee must be less than the entered amount.");
      return;
    }

    setSaving(true);

    // home_amount is what was actually exchanged (not the fee portion)
    const effectiveHome =
      hasFee && feeType === "inclusive" ? homeNum - feeNum : homeNum;

    const input: CreatePurchaseInput = {
      trip_id: tripId,
      home_amount: Math.round(effectiveHome * 100) / 100,
      foreign_amount: Math.round(foreignNum * 100) / 100,
      exchange_rate: rateNum,
      fee_amount: hasFee ? Math.round(feeNum * 100) / 100 : undefined,
      purchased_at: new Date(purchasedAt).toISOString(),
      notes: notes.trim() || undefined,
    };

    try {
      const purchase = await storage.addPurchase(input);
      reset();
      onCreated(purchase);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add purchase",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          reset();
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-foreground">
          Add Purchase
        </h2>
        <p className="mt-1 text-sm text-muted">
          Record a {homeCurrency} &rarr; {targetCurrency} exchange.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Amount spent */}
          <div>
            <label
              htmlFor="home-amount"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Amount Spent ({homeCurrency})
            </label>
            <input
              id="home-amount"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={homeAmount}
              onChange={(e) => setHomeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>

          {/* Exchange rate */}
          <div>
            <label
              htmlFor="exchange-rate"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Exchange Rate (1 {homeCurrency} = ? {targetCurrency})
            </label>
            <input
              id="exchange-rate"
              type="number"
              required
              min="0.000001"
              step="any"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>

          {/* Transaction fee */}
          <div>
            <label
              htmlFor="fee-amount"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Transaction Fee ({homeCurrency})
              <span className="ml-1 text-muted/50">(optional)</span>
            </label>
            <input
              id="fee-amount"
              type="number"
              min="0"
              step="0.01"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>

          {/* Fee type radio cards — only visible when fee > 0 */}
          {hasFee && homeNum > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {/* Inclusive card */}
              <button
                type="button"
                onClick={() => setFeeType("inclusive")}
                className={`rounded-xl border-2 px-3.5 py-3 text-left transition-colors ${
                  feeType === "inclusive"
                    ? "border-accent bg-accent/5"
                    : "border-border bg-background hover:border-foreground/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      feeType === "inclusive"
                        ? "border-accent"
                        : "border-muted/40"
                    }`}
                  >
                    {feeType === "inclusive" && (
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Inclusive
                  </span>
                </div>
                <p className="mt-1 pl-6 text-xs text-muted">
                  Fee deducted from amount
                </p>
                <p className="mt-0.5 pl-6 text-xs text-muted/50">
                  e.g. Wise, Revolut
                </p>
                <div className="mt-2.5 rounded-md bg-foreground/5 px-2.5 py-1.5">
                  <p className="text-xs text-muted">Out of pocket</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {formatAmount(homeNum, homeCurrency)}{" "}
                    <span className="font-normal text-muted">
                      {homeCurrency}
                    </span>
                  </p>
                </div>
              </button>

              {/* Exclusive card */}
              <button
                type="button"
                onClick={() => setFeeType("exclusive")}
                className={`rounded-xl border-2 px-3.5 py-3 text-left transition-colors ${
                  feeType === "exclusive"
                    ? "border-accent bg-accent/5"
                    : "border-border bg-background hover:border-foreground/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      feeType === "exclusive"
                        ? "border-accent"
                        : "border-muted/40"
                    }`}
                  >
                    {feeType === "exclusive" && (
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Exclusive
                  </span>
                </div>
                <p className="mt-1 pl-6 text-xs text-muted">
                  Fee added on top
                </p>
                <p className="mt-0.5 pl-6 text-xs text-muted/50">
                  e.g. Cash kiosk, bank
                </p>
                <div className="mt-2.5 rounded-md bg-foreground/5 px-2.5 py-1.5">
                  <p className="text-xs text-muted">Out of pocket</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {formatAmount(homeNum + feeNum, homeCurrency)}{" "}
                    <span className="font-normal text-muted">
                      {homeCurrency}
                    </span>
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Live preview */}
          {homeNum > 0 && rateNum > 0 && (
            <div className="rounded-lg bg-accent/5 px-4 py-3">
              <p className="text-sm text-muted">
                You receive{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {formatAmount(
                    foreignNum > 0 ? foreignNum : 0,
                    targetCurrency,
                  )}{" "}
                  {targetCurrency}
                </span>
              </p>
              {hasFee && (
                <p className="mt-1 text-xs text-amber-400/80">
                  Total out of pocket:{" "}
                  <span className="tabular-nums">
                    {formatAmount(totalOutOfPocket, homeCurrency)} {homeCurrency}
                  </span>
                  {feeType === "inclusive" && exchangedAmount > 0 && (
                    <span className="text-muted/60">
                      {" "}
                      ({formatAmount(exchangedAmount, homeCurrency)} exchanged +{" "}
                      {formatAmount(feeNum, homeCurrency)} fee)
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Date + Notes row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="purchase-date"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Date
              </label>
              <input
                id="purchase-date"
                type="date"
                value={purchasedAt}
                onChange={(e) => setPurchasedAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
            <div>
              <label
                htmlFor="purchase-notes"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Notes
                <span className="ml-1 text-muted/50">(optional)</span>
              </label>
              <input
                id="purchase-notes"
                type="text"
                maxLength={100}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Airport kiosk"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
