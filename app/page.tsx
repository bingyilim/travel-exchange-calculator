import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Travel Exchange | Currency DCA Calculator for Travelers",
  description:
    "Track your Dollar Cost Averaging when buying foreign currency for travel. Calculate your true blended exchange rate, account for fees, and know exactly what things cost abroad. Free, no account required.",
  keywords: [
    "currency exchange calculator",
    "DCA calculator",
    "travel currency tracker",
    "blended exchange rate",
    "dollar cost averaging currency",
    "travel money calculator",
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Travel Exchange
          </span>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-20 text-center sm:pt-28">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
            Free. No account needed.
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Know the <span className="text-accent">true cost</span> of
            everything you buy abroad
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Track your currency purchases. See your real blended exchange rate,
            fees included. That &#165;5,000 ramen? You&#39;ll know exactly what
            it costs.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard?guest=true"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-opacity hover:opacity-90 sm:w-auto"
          >
            Try it Free (No Account)
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 sm:w-auto"
          >
            Sign In
          </Link>
        </div>

        {/* Social proof line */}
        <p className="mt-8 text-xs text-muted/60">
          Runs in your browser. Your data stays on your device until you choose
          to sync.
        </p>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="mb-3 text-center text-sm font-medium uppercase tracking-widest text-muted">
            How it works
          </h2>
          <p className="mx-auto mb-14 max-w-md text-center text-lg text-foreground/80">
            Three steps. Smarter travel money.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-lg font-bold text-accent">
                1
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Create a Trip
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Pick your currencies. Heading to Japan? Set up
                USD&nbsp;&rarr;&nbsp;JPY and you&#39;re ready.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-lg font-bold text-accent">
                2
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Log Each Exchange
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Amount, rate, fees. Bought from Wise? Airport kiosk? Log it in
                seconds. We handle both fee types.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-lg font-bold text-accent">
                3
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                See Your True Rate
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Your blended DCA rate updates live. Type any price and see the
                real cost in your home currency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="mb-3 text-center text-sm font-medium uppercase tracking-widest text-muted">
            Features
          </h2>
          <p className="mx-auto mb-14 max-w-md text-center text-lg text-foreground/80">
            Built for travelers who buy smart
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-border bg-card px-6 py-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <svg
                  className="h-5 w-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                No Account Required
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Start tracking right now as a guest. All data lives in your
                browser. Private. Instant. Zero friction.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-border bg-card px-6 py-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <svg
                  className="h-5 w-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                True Blended Rate Math
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Nominal rate vs. true rate after fees. See exactly how much that
                airport kiosk surcharge actually cost you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-border bg-card px-6 py-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <svg
                  className="h-5 w-5 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Cloud Sync
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Create a free account to sync across devices. Your guest data
                migrates automatically. Nothing is lost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Stop guessing. Start tracking.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
            Every currency purchase is a data point. Let your blended rate tell
            you the truth about your travel budget.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/dashboard?guest=true"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-opacity hover:opacity-90 sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <span className="text-xs text-muted/50">
            Travel Exchange Calculator
          </span>
          <span className="text-xs text-muted/50">
            100% free. No ads. No tracking.
          </span>
        </div>
      </footer>
    </div>
  );
}
