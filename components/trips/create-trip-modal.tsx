"use client";

import { useState } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import { CURRENCIES } from "@/lib/currencies";
import type { CreateTripInput, Trip } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (trip: Trip) => void;
};

export function CreateTripModal({ open, onClose, onCreated }: Props) {
  const { storage } = useStorage();

  const [name, setName] = useState("");
  const [homeCurrency, setHomeCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("JPY");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function reset() {
    setName("");
    setHomeCurrency("USD");
    setTargetCurrency("JPY");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (homeCurrency === targetCurrency) {
      setError("Home and target currencies must be different.");
      return;
    }

    setSaving(true);

    const input: CreateTripInput = {
      name: name.trim(),
      home_currency: homeCurrency,
      target_currency: targetCurrency,
    };

    try {
      const trip = await storage.createTrip(input);
      reset();
      onCreated(trip);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip");
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
        <h2 className="text-lg font-semibold text-foreground">New Trip</h2>
        <p className="mt-1 text-sm text-muted">
          Set up a currency pair to track your purchases.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Trip name */}
          <div>
            <label
              htmlFor="trip-name"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Trip Name
            </label>
            <input
              id="trip-name"
              type="text"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Japan 2026"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>

          {/* Currency selects */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="home-currency"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Home Currency
              </label>
              <select
                id="home-currency"
                value={homeCurrency}
                onChange={(e) => setHomeCurrency(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="target-currency"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Target Currency
              </label>
              <select
                id="target-currency"
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
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
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#64748b] transition-colors hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-accent-glow transition-all hover:shadow-md hover:shadow-accent-glow disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
