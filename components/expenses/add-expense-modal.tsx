"use client";

import { useState } from "react";
import type { CreateExpenseInput, Expense } from "@/lib/types";
import { addExpense } from "@/app/actions/expenses";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Accommodation",
  "Other",
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (expense: Expense) => void;
  tripId: string;
  targetCurrency: string;
};

export function AddExpenseModal({
  open,
  onClose,
  onCreated,
  tripId,
  targetCurrency,
}: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Food");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const amountNum = parseFloat(amount) || 0;

  function reset() {
    setAmount("");
    setCategory("Food");
    setNotes("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (amountNum <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    setSaving(true);

    const input: CreateExpenseInput = {
      trip_id: tripId,
      amount_foreign: Math.round(amountNum * 100) / 100,
      category,
      notes: notes.trim() || undefined,
    };

    try {
      const expense = await addExpense(input);
      reset();
      onCreated(expense);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add expense",
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
              New entry · Spending
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl text-accent leading-[1.05] tracking-tight">
              Record spending
            </h2>

            {/* Subtitle */}
            <p className="mt-1.5 font-serif italic text-sm text-muted">
              Log a purchase in{" "}
              <span className="not-italic text-stamp">{targetCurrency}</span>.
            </p>
          </div>

          {/* BODY — scroll area */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 [-webkit-overflow-scrolling:touch] space-y-5">
            {/* Hero amount input */}
            <div>
            <div className="flex justify-between items-baseline mb-2">
              <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
                Amount
              </div>
              <span className="font-mono text-[9px] tracking-[0.16em] text-muted/70">
                {targetCurrency}
              </span>
            </div>
            <div className="flex items-end gap-3 border-b-[1.5px] border-foreground pb-1.5 h-14">
              <input
                id="expense-amount"
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 min-w-0 bg-transparent border-none outline-none font-serif text-4xl text-accent leading-none tracking-tight p-0 placeholder:text-muted/30"
                style={{ height: 50 }}
              />
              <span className="font-mono text-sm text-foreground/70 tracking-wider pb-1">
                {targetCurrency}
              </span>
            </div>
          </div>

          {/* Category — mono uppercase chips */}
          <div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted mb-2.5">
              Category
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] border-[1.5px] transition-colors ${
                      active
                        ? "border-foreground text-foreground bg-stamp/[0.06] dark:bg-stamp/[0.08]"
                        : "border-border text-muted hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <PassportField label="Notes" hint="optional">
            <input
              id="expense-notes"
              type="text"
              maxLength={100}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ichiran Ramen, Shibuya"
              className={`w-full bg-transparent border-none outline-none font-serif text-sm text-foreground placeholder:text-muted/50 placeholder:italic py-1 ${
                notes ? "" : "italic"
              }`}
            />
          </PassportField>

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
                {saving ? "Saving…" : "Record spending"}
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
