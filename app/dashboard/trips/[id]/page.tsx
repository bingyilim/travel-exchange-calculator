"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStorage } from "@/components/providers/storage-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { DcaSummary } from "@/components/purchases/dca-summary";
import { ExpenseCalculator } from "@/components/trips/expense-calculator";
import { PurchaseList } from "@/components/purchases/purchase-list";
import { AddPurchaseModal } from "@/components/purchases/add-purchase-modal";
import { ExpenseLedger } from "@/components/expenses/expense-ledger";
// import { SpendingPieChart } from "@/components/expenses/spending-pie-chart";
import { SpendingBars } from "@/components/expenses/spending-bars";
import { AddExpenseModal } from "@/components/expenses/add-expense-modal";
import {
  getExpensesByTrip,
  deleteExpense,
} from "@/app/actions/expenses";
import { calculateDca } from "@/lib/utils/dca";
import type { Trip, Purchase, Expense } from "@/lib/types";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { storage, isGuest } = useStorage();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(!isGuest);
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

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

  const stats = useMemo(() => calculateDca(purchases), [purchases]);
  const totalExpensesForeign = useMemo(
    () => expenses.reduce((s, e) => s + e.amount_foreign, 0),
    [expenses],
  );
  const hasPurchases = purchases.length > 0;

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

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-5xl px-6 sm:px-14 pb-20">
        {/* Top doc strip */}
        <div className="flex items-center justify-between pt-6 pb-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          <Link
            href="/dashboard"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="hidden sm:inline">
            Doc № TX-{new Date(trip.created_at).getFullYear()} · Entry{" "}
            {String(purchases.length).padStart(2, "0")}
          </span>
          <ThemeToggle />
        </div>

        {/* Header — trip identity */}
        <header className="border-t-2 border-foreground border-b border-border py-7">
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_auto] gap-6 sm:items-end">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-stamp mb-2">
                Trip Ledger · {trip.is_active ? "Active" : "Closed"}
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl text-accent leading-[0.95] tracking-tight">
                {trip.name}
              </h1>
              <div className="mt-3.5 font-mono text-sm text-foreground/70 tracking-wider">
                {trip.home_currency}
                <span className="text-muted mx-2">▸</span>
                <span className="text-stamp">{trip.target_currency}</span>
                <span className="text-muted mx-3">·</span>
                <span className="text-[11px] uppercase tracking-[0.1em]">
                  Issued{" "}
                  {new Date(trip.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-doc self-start sm:self-auto"
              style={{
                background: "var(--accent)",
                color: "var(--background)",
                borderColor: "var(--accent)",
              }}
            >
              + Log exchange
            </button>
          </div>
        </header>

        {/* Empty-state nudge */}
        {!hasPurchases && (
          <p className="mt-8 mb-2 font-serif italic text-foreground/70 text-center">
            Begin by logging your first cash exchange — your true rate will
            appear here.
          </p>
        )}

        {/* § I — Ledger Summary */}
        <PassportSection
          numeral="I"
          title="Ledger summary"
          subtitle="Computed from logged exchanges and recorded spending."
        >
          <DcaSummary
            purchases={purchases}
            homeCurrency={trip.home_currency}
            targetCurrency={trip.target_currency}
            totalExpensesForeign={totalExpensesForeign}
          />
        </PassportSection>

        {/* § II — Cost Lookup */}
        <PassportSection
          numeral="II"
          title="Cost lookup"
          subtitle="Enter a foreign-currency price to see its true home-currency cost."
        >
          <ExpenseCalculator
            trueRate={stats.trueRate}
            homeCurrency={trip.home_currency}
            targetCurrency={trip.target_currency}
            onLogExchange={() => setModalOpen(true)}
          />
        </PassportSection>

        {/* § III — Cash Exchanges */}
        <PassportSection
          numeral="III"
          title="Cash exchanges"
          subtitle={`Logged purchases of foreign currency. ${
            purchases.length > 0 ? `(${purchases.length})` : ""
          }`}
        >
          <PurchaseList
            purchases={purchases}
            homeCurrency={trip.home_currency}
            targetCurrency={trip.target_currency}
            onDelete={handleDeletePurchase}
          />
        </PassportSection>

        {/* § IV — Recorded Spending */}
        <PassportSection
          numeral="IV"
          title="Recorded spending"
          subtitle="What you've spent at your destination."
          action={
            !isGuest ? (
              <button
                onClick={() => setExpenseModalOpen(true)}
                className="btn-doc btn-doc-sm"
              >
                + Record spending
              </button>
            ) : undefined
          }
        >
          <ExpenseLedger
            expenses={expenses}
            loading={expensesLoading}
            trueRate={stats.trueRate}
            homeCurrency={trip.home_currency}
            targetCurrency={trip.target_currency}
            isGuest={isGuest}
            onDelete={handleDeleteExpense}
          />
        </PassportSection>

        {/* § V — Analytics */}
        {!isGuest && expenses.length > 0 && (
          <PassportSection
            numeral="V"
            title="Analytics"
            subtitle="Spending breakdown by category."
          >
            {/*
              Pie chart commented out — replaced with horizontal bar chart.
              <SpendingPieChart
                expenses={expenses}
                targetCurrency={trip.target_currency}
              />
            */}
            <SpendingBars
              expenses={expenses}
              targetCurrency={trip.target_currency}
            />
          </PassportSection>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-3.5 border-t border-border flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <span>Document valid · this device</span>
          <span className="hidden sm:inline">
            No tracking · No transmission
          </span>
          <span>End of record</span>
        </footer>
      </div>

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

      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onCreated={(expense) => {
          setExpenses((prev) => [expense, ...prev]);
          setExpenseModalOpen(false);
        }}
        tripId={trip.id}
        targetCurrency={trip.target_currency}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PassportSection — § I, § II, § III header block
// ─────────────────────────────────────────────────────────────────────────

function PassportSection({
  numeral,
  title,
  subtitle,
  action,
  children,
}: {
  numeral: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-11">
      <div className="flex items-baseline gap-3.5 mb-1">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">
          Section {numeral}
        </span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <div className="flex justify-between items-end gap-6 mb-5">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-accent tracking-tight mt-2 mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="font-serif italic text-muted text-sm">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
