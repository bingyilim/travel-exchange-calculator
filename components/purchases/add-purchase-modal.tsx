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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => {
          reset();
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md h-full sm:h-auto sm:max-h-[calc(100dvh-3rem)] border-[1.5px] border-foreground bg-card shadow-2xl flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="contents">
          {/* HEADER — sticky */}
          <div className="flex-none px-6 sm:px-8 pt-5 sm:pt-7 pb-4 bg-card border-b border-border">
            {/* Eyebrow */}
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-stamp mb-1.5">
              New entry · Cash exchange
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl text-accent leading-[1.05] tracking-tight">
              Add purchase
            </h2>

            {/* Subtitle */}
            <p className="mt-1.5 font-serif italic text-sm text-muted">
              Record a{" "}
              <span className="not-italic text-foreground">{homeCurrency}</span>{" "}
              <span className="text-muted/60">▸</span>{" "}
              <span className="not-italic text-stamp">{targetCurrency}</span>{" "}
              exchange.
            </p>
          </div>

          {/* BODY — scroll area */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 [-webkit-overflow-scrolling:touch] space-y-4">
            {/* Amount spent */}
            <PassportField label="Amount spent" suffix={homeCurrency}>
            <input
              id="home-amount"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={homeAmount}
              onChange={(e) => setHomeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent border-none outline-none font-mono text-base tabular-nums text-foreground placeholder:text-muted/40 py-1"
            />
          </PassportField>

          {/* Exchange rate */}
          <PassportField
            label="Exchange rate"
            hint={`1 ${homeCurrency} = ? ${targetCurrency}`}
            suffix={targetCurrency}
          >
            <input
              id="exchange-rate"
              type="number"
              required
              min="0.000001"
              step="any"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent border-none outline-none font-mono text-base tabular-nums text-foreground placeholder:text-muted/40 py-1"
            />
          </PassportField>

          {/* Transaction fee */}
          <PassportField
            label="Transaction fee"
            hint="optional"
            suffix={homeCurrency}
          >
            <input
              id="fee-amount"
              type="number"
              min="0"
              step="0.01"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent border-none outline-none font-mono text-base tabular-nums text-foreground placeholder:text-muted/40 py-1"
            />
          </PassportField>

          {/* Fee type cards — only when fee > 0 */}
          {hasFee && homeNum > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <FeeCard
                active={feeType === "inclusive"}
                onClick={() => setFeeType("inclusive")}
                title="Inclusive"
                desc="Fee deducted from amount"
                eg="e.g. Wise, Revolut"
                oop={formatAmount(homeNum, homeCurrency)}
                currency={homeCurrency}
              />
              <FeeCard
                active={feeType === "exclusive"}
                onClick={() => setFeeType("exclusive")}
                title="Exclusive"
                desc="Fee added on top"
                eg="e.g. Cash kiosk, bank"
                oop={formatAmount(homeNum + feeNum, homeCurrency)}
                currency={homeCurrency}
              />
            </div>
          )}

          {/* Receipt preview — terracotta left rule */}
          {homeNum > 0 && rateNum > 0 && (
            <div className="bg-stamp/[0.06] dark:bg-stamp/[0.08] border-l-2 border-stamp px-4 py-3.5">
              <div className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-stamp mb-1.5">
                Receipt preview
              </div>
              <p className="font-serif text-sm text-foreground/80 m-0">
                You receive{" "}
                <span className="font-serif text-lg text-foreground tabular-nums">
                  {formatAmount(
                    foreignNum > 0 ? foreignNum : 0,
                    targetCurrency,
                  )}
                </span>
                <span className="font-mono text-[11px] text-muted ml-1.5 tracking-wider">
                  {targetCurrency}
                </span>
              </p>
              {hasFee && (
                <p className="mt-1.5 font-serif text-xs text-muted leading-snug m-0">
                  Total out of pocket:{" "}
                  <span className="font-mono text-foreground tabular-nums">
                    {formatAmount(totalOutOfPocket, homeCurrency)}{" "}
                    {homeCurrency}
                  </span>
                  {feeType === "inclusive" && exchangedAmount > 0 && (
                    <span className="text-muted/70 italic">
                      {" "}
                      ({formatAmount(exchangedAmount, homeCurrency)} exchanged
                      + {formatAmount(feeNum, homeCurrency)} fee)
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Date + Notes — fixed-height aligned underlines */}
          <div className="grid grid-cols-[1fr_1.5fr] gap-4 pt-1">
            <PassportField label="Date">
              <input
                id="purchase-date"
                type="date"
                value={purchasedAt}
                onChange={(e) => setPurchasedAt(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-mono text-[13px] text-foreground py-1 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </PassportField>
            <PassportField label="Notes" hint="optional">
              <input
                id="purchase-notes"
                type="text"
                maxLength={100}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Airport kiosk"
                className={`w-full bg-transparent border-none outline-none font-serif text-sm text-foreground placeholder:text-muted/50 placeholder:italic py-1 ${
                  notes ? "" : "italic"
                }`}
              />
            </PassportField>
          </div>

            {/* Error */}
            {error && (
              <p className="bg-destructive/10 border-l-2 border-destructive px-3 py-2 font-serif text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          {/* FOOTER — sticky */}
          <div className="flex-none px-6 sm:px-8 py-3 bg-card border-t border-border">
            <div className="flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted hover:text-foreground px-3 py-2.5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-doc disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--accent)",
                  color: "var(--background)",
                  borderColor: "var(--accent)",
                }}
              >
                {saving ? "Saving…" : "Add purchase"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PassportField — underline-style input wrapper
// ─────────────────────────────────────────────────────────────────────────

function PassportField({
  label,
  hint,
  suffix,
  children,
}: {
  label: string;
  hint?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
          {label}
          {hint && (
            <span className="ml-1.5 font-serif italic normal-case tracking-normal text-[10px] text-muted/70">
              ({hint})
            </span>
          )}
        </div>
        {suffix && (
          <span className="font-mono text-[9px] tracking-[0.16em] text-muted/70">
            {suffix}
          </span>
        )}
      </div>
      <div className="border-b-[1.5px] border-foreground pb-1.5 h-9 flex items-end focus-within:border-foreground transition-colors">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FeeCard — inclusive / exclusive selector
// ─────────────────────────────────────────────────────────────────────────

function FeeCard({
  active,
  onClick,
  title,
  desc,
  eg,
  oop,
  currency,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  eg: string;
  oop: string;
  currency: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-3.5 pt-3.5 pb-3 text-left transition-colors border-[1.5px] ${
        active
          ? "border-foreground bg-stamp/[0.04] dark:bg-stamp/[0.06]"
          : "border-border bg-transparent hover:border-foreground/40"
      }`}
    >
      {active && (
        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-stamp" />
      )}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="font-serif text-lg text-accent leading-none">
          {title}
        </div>
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-muted whitespace-nowrap">
          {oop} <span className="text-muted/70 ml-0.5">{currency}</span>
        </span>
      </div>
      <p className="font-serif text-xs text-muted m-0 leading-snug">
        {desc} <span className="italic text-muted/70">— {eg}</span>
      </p>
    </button>
  );
}
