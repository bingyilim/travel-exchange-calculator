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

  const activeTrips = trips.filter((t) => t.is_active);
  const archivedTrips = trips.filter((t) => !t.is_active);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-[1100px] px-6 pb-20 sm:px-14">
        {/* ── Document Header ────────────────────────────────────── */}
        <header className="border-b-2 border-[color:var(--border-strong)] pt-8 pb-5">
          <div className="flex items-end justify-between gap-8">
            <h1
              className="m-0 font-serif text-[38px] leading-none text-[color:var(--accent)]"
              style={{ letterSpacing: "-0.01em" }}
            >
              Travel Exchange
            </h1>
            <div className="flex items-end gap-6">
              <div
                className="hidden text-right font-mono text-[11px] leading-relaxed text-muted sm:block"
                style={{ letterSpacing: "0.04em" }}
              >
                HOLDER ·{" "}
                {(isGuest ? "Guest" : (userEmail ?? "")).toUpperCase()}
              </div>
              <ThemeToggle />
              <a
                href="/auth/signout"
                className="font-mono text-[10px] uppercase text-muted transition-colors hover:text-foreground"
                style={{ letterSpacing: "0.18em" }}
              >
                {isGuest ? "Exit" : "Sign out"}
              </a>
            </div>
          </div>

          {/* Registration line: doc № and issue date — feels like a form */}
          <div
            className="mt-4 flex items-center gap-4 font-mono text-[10px] uppercase text-[color:var(--muted-faint)]"
            style={{ letterSpacing: "0.22em" }}
          >
            <span>Doc № TX-2026</span>
            <span className="h-px flex-1 bg-[color:var(--border)]" />
            <span>{today}</span>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-24">
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
          <>
            {/* ── Section I — In progress ─────────────────────────── */}
            <Section
              numeral="I"
              title="In progress"
              subtitle={
                activeTrips.length === 0
                  ? "No open trips. Begin recording a new journey below."
                  : activeTrips.length === 1
                    ? "One trip is open at the time of issue."
                    : "Multiple trips are open. Most recent first."
              }
              action={
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-doc self-start sm:self-auto"
                >
                  + Issue trip
                </button>
              }
            >
              <TripList
                trips={activeTrips}
                onDelete={handleDelete}
                variant="active"
                onCreate={() => setModalOpen(true)}
              />
            </Section>

            {/* ── Section II — Past entries ───────────────────────── */}
            {archivedTrips.length > 0 && (
              <Section
                numeral="II"
                title="Past entries"
                subtitle={`${archivedTrips.length} closed trip${
                  archivedTrips.length === 1 ? "" : "s"
                } on record.`}
              >
                <TripList
                  trips={archivedTrips}
                  onDelete={handleDelete}
                  variant="archive"
                />
              </Section>
            )}
          </>
        )}

        {/* ── Guest banner ─────────────────────────────────────────── */}
        {isGuest && !loading && (
          <div className="mt-16 border border-dashed border-[color:var(--border-strong)] bg-[color:var(--accent-glow)] px-7 py-5">
            <div
              className="mb-2 font-mono text-[10px] uppercase text-[color:var(--stamp)]"
              style={{ letterSpacing: "0.22em" }}
            >
              ✦ Notice
            </div>
            <p className="m-0 text-[14px] italic text-muted">
              Your data is stored locally on this device.{" "}
              <a
                href="/login"
                className="text-[color:var(--accent)] underline decoration-[color:var(--border-strong)] underline-offset-4 hover:decoration-[color:var(--accent)]"
              >
                Create an account
              </a>{" "}
              to sync across devices.
            </p>
          </div>
        )}

        {/* ── Document Footer ──────────────────────────────────────── */}
        <footer
          className="mt-16 flex items-center justify-between border-t border-[color:var(--border)] pt-4 font-mono text-[10px] uppercase text-[color:var(--muted-faint)]"
          style={{ letterSpacing: "0.2em" }}
        >
          <span>Document valid · this device</span>
          <span className="hidden sm:inline">No tracking · No transmission</span>
          <span>End of record</span>
        </footer>
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

// ─────────────────────────────────────────────────────────────────────────
// Section — § I, § II header block
// ─────────────────────────────────────────────────────────────────────────

function Section({
  numeral,
  title,
  subtitle,
  action,
  children,
}: {
  numeral: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-11">
      <div className="mb-1 flex items-baseline gap-3.5">
        <span
          className="font-mono text-[11px] font-semibold uppercase text-[color:var(--stamp)]"
          style={{ letterSpacing: "0.22em" }}
        >
          Section {numeral}
        </span>
        <span className="h-px flex-1 bg-[color:var(--border)]" />
      </div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h2
            className="m-0 mt-2 font-serif text-[30px] leading-tight text-[color:var(--accent)]"
            style={{ letterSpacing: "-0.01em" }}
          >
            {title}
          </h2>
          <p className="m-0 text-[14px] italic text-muted">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
