"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStorage } from "@/components/providers/storage-provider";
import { DcaSummary } from "@/components/purchases/dca-summary";
import { ExpenseCalculator } from "@/components/trips/expense-calculator";
import { PurchaseList } from "@/components/purchases/purchase-list";
import { AddPurchaseModal } from "@/components/purchases/add-purchase-modal";
import { ExpenseLedger } from "@/components/expenses/expense-ledger";
import { SpendingPieChart } from "@/components/expenses/spending-pie-chart";
import {
  getExpensesByTrip,
  deleteExpense,
} from "@/app/actions/expenses";
import { calculateDca } from "@/lib/utils/dca";
import type { Trip, Purchase, Expense } from "@/lib/types";

type Tab = "activity" | "analytics";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { storage, isGuest } = useStorage();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(!isGuest);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  // -- Data fetching ---------------------------------------------------------

  useEffect(() => {
    Promise.all([storage.getTrip(id), storage.getPurchasesForTrip(id)]).then(
      ([t, p]) => {
        setTrip(t);
        setPurchases(p);
        setLoading(false);
      },
    );
  }, [storage, id]);

  useEffect(() => {
    if (isGuest) return;
    getExpensesByTrip(id).then((e) => {
      setExpenses(e);
      setExpensesLoading(false);
    });
  }, [id, isGuest]);

  // -- Derived values --------------------------------------------------------

  const stats = useMemo(() => calculateDca(purchases), [purchases]);

  const totalExpensesForeign = useMemo(
    () => expenses.reduce((s, e) => s + e.amount_foreign, 0),
    [expenses],
  );

  // -- Handlers --------------------------------------------------------------

  const handleDeletePurchase = useCallback(
    async (purchaseId: string) => {
      await storage.deletePurchase(purchaseId);
      setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
    },
    [storage],
  );

  const handleDeleteExpense = useCallback(async (expId: string) => {
    await deleteExpense(expId);
    setExpenses((prev) => prev.filter((e) => e.id !== expId));
  }, []);

  // -- Loading / Not found ---------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
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
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
        <p className="text-sm text-muted">Trip not found.</p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-accent hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // -- Render ----------------------------------------------------------------

  return (
    <div className="min-h-dvh bg-background">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
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
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            Dashboard
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {trip.name}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-xs text-foreground/70">
                  {trip.home_currency}
                  <span className="text-muted/50">&rarr;</span>
                  {trip.target_currency}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    trip.is_active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-muted/10 text-muted"
                  }`}
                >
                  {trip.is_active ? "Active" : "Closed"}
                </span>
              </div>
            </div>
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
              Add Purchase
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* DCA summary cards */}
        <DcaSummary
          purchases={purchases}
          homeCurrency={trip.home_currency}
          targetCurrency={trip.target_currency}
          totalExpensesForeign={totalExpensesForeign}
        />

        {/* Expense calculator */}
        <div className="mt-4">
          <ExpenseCalculator
            trueRate={stats.trueRate}
            homeCurrency={trip.home_currency}
            targetCurrency={trip.target_currency}
          />
        </div>

        {/* ── Tab bar ───────────────────────────────────────────────── */}
        <div className="mt-8 rounded-xl border border-border/50 bg-card/30 p-1 backdrop-blur-md">
          <div className="flex">
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "activity"
                  ? "bg-background/80 text-foreground shadow-sm"
                  : "text-muted hover:text-foreground/70"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-background/80 text-foreground shadow-sm"
                  : "text-muted hover:text-foreground/70"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* ── Tab content ───────────────────────────────────────────── */}
        <div className="mt-6">
          {activeTab === "activity" ? (
            <>
              {/* Purchase history */}
              <div>
                <h2 className="mb-4 text-sm font-medium text-muted">
                  Purchase History
                  {purchases.length > 0 && (
                    <span className="ml-2 text-foreground/40">
                      ({purchases.length})
                    </span>
                  )}
                </h2>
                <PurchaseList
                  purchases={purchases}
                  homeCurrency={trip.home_currency}
                  targetCurrency={trip.target_currency}
                  onDelete={handleDeletePurchase}
                />
              </div>

              {/* Expense Ledger */}
              <div className="mt-8">
                <ExpenseLedger
                  expenses={expenses}
                  loading={expensesLoading}
                  tripId={trip.id}
                  trueRate={stats.trueRate}
                  homeCurrency={trip.home_currency}
                  targetCurrency={trip.target_currency}
                  isGuest={isGuest}
                  onCreated={(expense) =>
                    setExpenses((prev) => [expense, ...prev])
                  }
                  onDelete={handleDeleteExpense}
                />
              </div>
            </>
          ) : (
            <>
              {/* Analytics: Spending breakdown */}
              {!isGuest && expenses.length > 0 ? (
                <SpendingPieChart
                  expenses={expenses}
                  targetCurrency={trip.target_currency}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                  <p className="text-sm font-medium text-foreground/70">
                    No spending data yet
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {isGuest
                      ? "Sign up and log expenses to see your spending breakdown."
                      : "Log expenses on the Activity tab to see your spending breakdown."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Add purchase modal ────────────────────────────────────── */}
      <AddPurchaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(purchase) => {
          setPurchases((prev) => [purchase, ...prev]);
          setModalOpen(false);
        }}
        tripId={trip.id}
        homeCurrency={trip.home_currency}
        targetCurrency={trip.target_currency}
      />
    </div>
  );
}
