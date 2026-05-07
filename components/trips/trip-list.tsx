"use client";

import Link from "next/link";
import type { Trip } from "@/lib/types";

type Props = {
  trips: Trip[];
  onDelete: (id: string) => void;
  variant: "active" | "archive";
  onCreate?: () => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────
// TripList — variant-aware:
//   "active"  → passport-page hero card (full-width per trip)
//   "archive" → ledger row list (capped scroll, single column)
// ─────────────────────────────────────────────────────────────────────────

export function TripList({ trips, onDelete, variant, onCreate }: Props) {
  if (trips.length === 0 && variant === "active") {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-[color:var(--border-strong)] bg-[color:var(--accent-glow)] px-6 py-16 text-center">
        <div
          className="mb-3 font-mono text-[10px] uppercase text-[color:var(--stamp)]"
          style={{ letterSpacing: "0.22em" }}
        >
          ✦ No open trips
        </div>
        <h3 className="m-0 font-serif text-2xl text-[color:var(--accent)]">
          Begin a new entry
        </h3>
        <p className="mt-2 mb-5 max-w-md text-sm italic text-muted">
          Pick a currency pair, name the journey, and start recording.
        </p>
        {onCreate && (
          <button onClick={onCreate} className="btn-doc">
            + Issue trip
          </button>
        )}
      </div>
    );
  }

  if (variant === "active") {
    return (
      <div className="grid gap-6">
        {trips.map((trip) => (
          <ActiveCard key={trip.id} trip={trip} onDelete={onDelete} />
        ))}
      </div>
    );
  }

  // Archive: capped-scroll single-column ledger
  return (
    <div
      className="scrollbar-thin overflow-y-auto border-y-[1.5px] border-[color:var(--border-strong)]"
      style={{ maxHeight: 520 }}
    >
      {trips.map((trip, i) => (
        <ArchiveRow
          key={trip.id}
          trip={trip}
          index={i}
          isLast={i === trips.length - 1}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Active passport-page card — hero card, full-width per trip.
// ─────────────────────────────────────────────────────────────────────────

function ActiveCard({
  trip,
  onDelete,
}: {
  trip: Trip;
  onDelete: (id: string) => void;
}) {
  return (
    <Link
      href={`/dashboard/trips/${trip.id}`}
      className="group relative block border border-[color:var(--border-strong)] bg-[color:var(--card)] transition-shadow hover:shadow-[6px_6px_0_var(--border-strong)]"
      style={{ boxShadow: "4px 4px 0 var(--border-strong)" }}
    >
      {/* Top strip: section labels in form fields */}
      <div className="flex items-center justify-between border-b border-[color:var(--border)] px-7 py-3 sm:px-9">
        <span
          className="font-mono text-[10px] uppercase text-[color:var(--muted-faint)]"
          style={{ letterSpacing: "0.22em" }}
        >
          ✦ Currently active
        </span>
        <span
          className="stamp-box rotate-[-3deg] text-[color:var(--stamp-blue)]"
          style={{ borderColor: "var(--stamp-blue)" }}
        >
          Active
          <div className="text-[7px] mt-0.5">{trip.target_currency}</div>
        </span>
      </div>

      {/* Body grid */}
      <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
        {/* Left — title block */}
        <div className="border-b border-[color:var(--border)] p-7 sm:border-b-0 sm:border-r sm:p-9">
          <div
            className="mb-3 font-mono text-[10px] uppercase text-[color:var(--stamp)]"
            style={{ letterSpacing: "0.22em" }}
          >
            Trip Name
          </div>
          <h3
            className="m-0 font-serif text-[36px] leading-tight text-[color:var(--accent)] sm:text-[42px]"
            style={{ letterSpacing: "-0.01em" }}
          >
            {trip.name}
          </h3>
          <div
            className="mt-4 font-mono text-[11px] uppercase text-muted"
            style={{ letterSpacing: "0.1em" }}
          >
            {trip.target_currency} · Created {formatDate(trip.created_at)}
          </div>
          <div className="mt-7 inline-flex items-center gap-2.5 font-mono text-[10px] uppercase text-[color:var(--accent)] transition-colors group-hover:text-[color:var(--stamp)]"
            style={{ letterSpacing: "0.18em" }}
          >
            View ledger
            <span>→</span>
          </div>
        </div>

        {/* Right — fields grid */}
        <div className="grid grid-cols-2 gap-6 p-7 sm:p-9">
          <Field label="Currency pair">
            <span
              className="font-mono text-[18px] text-foreground"
              style={{ letterSpacing: "0.06em" }}
            >
              {trip.home_currency}{" "}
              <span className="text-[color:var(--muted-faint)]">▸</span>{" "}
              <span className="text-[color:var(--stamp)]">
                {trip.target_currency}
              </span>
            </span>
          </Field>
          <Field label="Status">
            <span className="font-serif text-[20px] text-[color:var(--accent)]">
              Open
            </span>
          </Field>
          <Field label="Issued">
            <span className="font-mono text-[14px] text-foreground">
              {formatDate(trip.created_at)}
            </span>
          </Field>
          <Field label="Last update">
            <span className="font-mono text-[14px] text-foreground">
              {formatDate(trip.updated_at)}
            </span>
          </Field>
        </div>
      </div>

      {/* Bottom strip: actions (delete) */}
      <div className="flex items-center justify-end border-t border-[color:var(--border)] px-7 py-2.5 sm:px-9">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm(`Delete "${trip.name}"? This cannot be undone.`)) {
              onDelete(trip.id);
            }
          }}
          className="cursor-pointer font-mono text-[10px] uppercase text-[color:var(--muted-faint)] transition-all hover:text-[color:var(--destructive)] sm:opacity-0 sm:group-hover:opacity-100"
          style={{ letterSpacing: "0.18em" }}
          aria-label={`Delete ${trip.name}`}
        >
          Delete entry
        </button>
      </div>
    </Link>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="mb-1.5 font-mono text-[9px] uppercase text-[color:var(--muted-faint)]"
        style={{ letterSpacing: "0.18em" }}
      >
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Archive row — single-line ledger entry.
// ─────────────────────────────────────────────────────────────────────────

function ArchiveRow({
  trip,
  index,
  isLast,
  onDelete,
}: {
  trip: Trip;
  index: number;
  isLast: boolean;
  onDelete: (id: string) => void;
}) {
  const stampRotate = [-3, 4, -2, 5][index % 4];
  return (
    <Link
      href={`/dashboard/trips/${trip.id}`}
      className={`group grid grid-cols-[1fr_auto_auto] items-center gap-3 px-1 py-5 transition-colors hover:bg-[color:var(--card-hover)] sm:grid-cols-[60px_1.6fr_1fr_120px_40px] sm:gap-6 ${
        isLast ? "" : "border-b border-[color:var(--border)]"
      }`}
    >
      {/* № — desktop only as standalone column */}
      <div
        className="hidden font-mono text-[10px] uppercase text-[color:var(--muted-faint)] sm:block"
        style={{ letterSpacing: "0.2em" }}
      >
        № {String(index + 1).padStart(3, "0")}
      </div>

      {/* Title + meta */}
      <div className="min-w-0">
        <div
          className="mb-1 font-mono text-[10px] uppercase text-[color:var(--muted-faint)] sm:hidden"
          style={{ letterSpacing: "0.2em" }}
        >
          № {String(index + 1).padStart(3, "0")}
        </div>
        <h4
          className="m-0 truncate font-serif text-[22px] leading-tight text-[color:var(--accent)]"
          style={{ letterSpacing: "-0.01em" }}
        >
          {trip.name}
        </h4>
        <div
          className="mt-1 font-mono text-[10px] text-muted"
          style={{ letterSpacing: "0.1em" }}
        >
          {trip.home_currency} ▸ {trip.target_currency} · Closed{" "}
          {formatDate(trip.updated_at)}
        </div>
      </div>

      {/* Pair (large, desktop only) */}
      <div className="hidden sm:block">
        <div
          className="font-mono text-[9px] uppercase text-[color:var(--muted-faint)]"
          style={{ letterSpacing: "0.18em" }}
        >
          Pair
        </div>
        <div
          className="mt-0.5 font-mono text-[13px] font-medium"
          style={{ letterSpacing: "0.04em" }}
        >
          {trip.home_currency} → {trip.target_currency}
        </div>
      </div>

      {/* Closed stamp */}
      <div
        className="stamp-box justify-self-end text-[color:var(--stamp-blue)]"
        style={{
          transform: `rotate(${stampRotate}deg)`,
          borderColor: "var(--stamp-blue)",
        }}
      >
        Closed
        <div className="text-[7px] mt-0.5">{trip.target_currency}</div>
      </div>

      {/* Delete — visible on mobile, hover-only on desktop */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm(`Delete "${trip.name}"? This cannot be undone.`)) {
            onDelete(trip.id);
          }
        }}
        className="cursor-pointer justify-self-end p-2 font-mono text-[14px] leading-none text-[color:var(--muted-faint)] transition-all hover:text-[color:var(--destructive)] sm:text-[10px] sm:uppercase sm:opacity-0 sm:group-hover:opacity-100"
        style={{ letterSpacing: "0.18em" }}
        aria-label={`Delete ${trip.name}`}
      >
        ✕
      </button>
    </Link>
  );
}
