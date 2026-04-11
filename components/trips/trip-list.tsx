"use client";

import Link from "next/link";
import type { Trip } from "@/lib/types";

type Props = {
  trips: Trip[];
  onDelete: (id: string) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TripList({ trips, onDelete }: Props) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <div className="mb-3 text-4xl opacity-30">&#9992;</div>
        <p className="text-sm font-medium text-foreground/70">No trips yet</p>
        <p className="mt-1 text-sm text-muted">
          Create your first trip to start tracking exchange rates.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {trips.map((trip) => (
        <Link
          key={trip.id}
          href={`/dashboard/trips/${trip.id}`}
          className="group flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-card-hover"
        >
          {/* Left: trip info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {trip.name}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  trip.is_active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-muted/10 text-muted"
                }`}
              >
                {trip.is_active ? "Active" : "Closed"}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-foreground/70">
                {trip.home_currency}
                <span className="text-muted/50">&rarr;</span>
                {trip.target_currency}
              </span>
              <span>Created {formatDate(trip.created_at)}</span>
            </div>
          </div>

          {/* Right: delete */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip.id);
            }}
            className="ml-4 shrink-0 rounded-lg p-2 text-muted/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            aria-label={`Delete ${trip.name}`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </Link>
      ))}
    </div>
  );
}
