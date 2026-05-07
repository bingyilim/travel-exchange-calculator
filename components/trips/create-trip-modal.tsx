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
        className="absolute inset-0 bg-[color:var(--foreground)]/40 backdrop-blur-sm"
        onClick={() => {
          reset();
          onClose();
        }}
      />

      {/* Modal — passport document */}
      <div
        className="relative w-full max-w-md border border-[color:var(--border-strong)] bg-[color:var(--card)]"
        style={{ boxShadow: "6px 6px 0 var(--border-strong)" }}
      >
        {/* Top strip */}
        <div className="flex items-center justify-between border-b border-[color:var(--border-strong)] px-6 py-3">
          <span
            className="font-mono text-[10px] uppercase text-[color:var(--stamp)]"
            style={{ letterSpacing: "0.22em" }}
          >
            ✦ New Entry
          </span>
          <span
            className="font-mono text-[10px] uppercase text-[color:var(--muted-faint)]"
            style={{ letterSpacing: "0.2em" }}
          >
            Form TX-01
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-7 sm:px-8">
          <h2
            className="m-0 font-serif text-[28px] leading-tight text-[color:var(--accent)]"
            style={{ letterSpacing: "-0.01em" }}
          >
            Issue a new trip
          </h2>
          <p className="mt-1 text-[13px] italic text-muted">
            Set up a currency pair and name the journey.
          </p>

          <form
            id="create-trip-form"
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            {/* Trip name */}
            <div>
              <label
                htmlFor="trip-name"
                className="mb-2 block font-mono text-[10px] uppercase text-[color:var(--muted-faint)]"
                style={{ letterSpacing: "0.18em" }}
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
                className="w-full border border-[color:var(--border-strong)] bg-[color:var(--background)] px-3 py-2.5 font-serif text-[16px] text-foreground placeholder:text-[color:var(--muted-faint)] placeholder:font-sans placeholder:italic focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              />
            </div>

            {/* Currency selects */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="home-currency"
                  className="mb-2 block font-mono text-[10px] uppercase text-[color:var(--muted-faint)]"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Home Currency
                </label>
                <select
                  id="home-currency"
                  value={homeCurrency}
                  onChange={(e) => setHomeCurrency(e.target.value)}
                  className="w-full border border-[color:var(--border-strong)] bg-[color:var(--background)] px-3 py-2.5 font-mono text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
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
                  className="mb-2 block font-mono text-[10px] uppercase text-[color:var(--muted-faint)]"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Target Currency
                </label>
                <select
                  id="target-currency"
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full border border-[color:var(--border-strong)] bg-[color:var(--background)] px-3 py-2.5 font-mono text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pair preview */}
            {homeCurrency !== targetCurrency && (
              <div className="border border-dashed border-[color:var(--border)] bg-[color:var(--accent-glow)] px-4 py-3">
                <div
                  className="font-mono text-[9px] uppercase text-[color:var(--muted-faint)]"
                  style={{ letterSpacing: "0.22em" }}
                >
                  Pair
                </div>
                <div
                  className="mt-1 font-mono text-[15px] text-foreground"
                  style={{ letterSpacing: "0.06em" }}
                >
                  {homeCurrency}{" "}
                  <span className="text-[color:var(--muted-faint)]">▸</span>{" "}
                  <span className="text-[color:var(--stamp)]">
                    {targetCurrency}
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/8 px-3 py-2">
                <div
                  className="mb-1 font-mono text-[9px] uppercase text-[color:var(--destructive)]"
                  style={{ letterSpacing: "0.22em" }}
                >
                  ✦ Error
                </div>
                <p className="m-0 text-[13px] italic text-[color:var(--destructive)]">
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Bottom strip — actions */}
        <div className="flex items-center justify-end gap-2 border-t border-[color:var(--border-strong)] bg-[color:var(--background)] px-6 py-3">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="cursor-pointer border border-[color:var(--border-strong)] bg-transparent px-4 py-2 font-mono text-[10px] uppercase text-foreground transition-colors hover:bg-[color:var(--card-hover)]"
            style={{ letterSpacing: "0.18em" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-trip-form"
            disabled={saving}
            className="cursor-pointer border-0 bg-[color:var(--accent)] px-4 py-2 font-mono text-[10px] uppercase text-[color:var(--background)] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ letterSpacing: "0.18em" }}
          >
            {saving ? "Issuing..." : "+ Issue trip"}
          </button>
        </div>
      </div>
    </div>
  );
}
