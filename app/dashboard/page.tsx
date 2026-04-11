"use client";

import { useCallback, useEffect, useState } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import { TripList } from "@/components/trips/trip-list";
import { CreateTripModal } from "@/components/trips/create-trip-modal";
import type { Trip } from "@/lib/types";

export default function DashboardPage() {
  const { storage, isGuest, userEmail } = useStorage();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    storage.getTrips().then((t) => {
      setTrips(t);
      setLoading(false);
    });
  }, [storage]);

  const handleDelete = useCallback(
    async (id: string) => {
      await storage.deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    },
    [storage],
  );

  return (
    <div className="min-h-dvh bg-background">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Travel Exchange
          </h1>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-muted">
              {isGuest ? "Guest" : userEmail}
            </span>
            <a
              href="/auth/signout"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {isGuest ? "Exit Guest Mode" : "Sign Out"}
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Section heading + new trip button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">Your Trips</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Trip
          </button>
        </div>

        {/* Trip list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <svg
              className="h-5 w-5 animate-spin text-muted"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : (
          <TripList trips={trips} onDelete={handleDelete} />
        )}

        {/* Guest banner */}
        {isGuest && (
          <div className="mt-8 rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-sm text-muted">
              Your data is stored locally on this device.{" "}
              <a
                href="/login"
                className="font-medium text-accent hover:underline"
              >
                Create an account
              </a>{" "}
              to sync across devices.
            </p>
          </div>
        )}
      </main>

      {/* ── Create trip modal ─────────────────────────────────────── */}
      <CreateTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(trip) => {
          setTrips((prev) => [trip, ...prev]);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
