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
        <h2 className="text-lg font-semibold text-foreground">Add Expense</h2>
        <p className="mt-1 text-sm text-muted">
          Log a purchase in {targetCurrency}.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Amount */}
          <div>
            <label
              htmlFor="expense-amount"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Amount ({targetCurrency})
            </label>
            <input
              id="expense-amount"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="expense-category"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Category
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="expense-notes"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Notes
              <span className="ml-1 text-muted/50">(optional)</span>
            </label>
            <input
              id="expense-notes"
              type="text"
              maxLength={100}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ichiran Ramen, Shibuya"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
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
              {saving ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
