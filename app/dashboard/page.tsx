"use client";

import { useCallback, useEffect, useState } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <div className="mx-auto max-w-5xl px-6">
        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 -mx-6 px-6 pt-4">
          <div className="rounded-2xl border border-border/50 bg-card px-6 py-3.5 dark:bg-card/60 dark:backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                Travel Exchange
              </h1>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/70 sm:inline-block">
                  {isGuest ? "Guest" : userEmail}
                </span>
                <ThemeToggle />
                <a
                  href="/auth/signout"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {isGuest ? "Exit Guest Mode" : "Sign Out"}
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div className="pt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">Your Trips</h2>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-accent-glow transition-all hover:shadow-lg hover:shadow-accent-glow"
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

          {isGuest && (
            <div className="mt-16 rounded-lg border border-border/60 bg-card px-5 py-4 shadow-sm dark:shadow-none">
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
        </div>
      </div>

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
