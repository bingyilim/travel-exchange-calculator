import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

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

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-6 w-8 ${className}`}>
      <span className="absolute left-0 top-0.5 h-5 w-5 rounded-full border-2 border-accent opacity-60" />
      <span className="absolute right-0 top-0.5 h-5 w-5 rounded-full border-2 border-accent" />
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh bg-background">
      {/* ── Background mesh ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-400/6 blur-[120px] dark:bg-blue-500/10" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-400/6 blur-[120px] dark:bg-violet-500/8" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-amber-300/4 blur-[120px] dark:bg-amber-500/5" />
      </div>

      {/* ── Floating Nav ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-border/50 bg-card/30 px-6 py-3.5 backdrop-blur-md dark:bg-card/30">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Travel Exchange
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Asymmetrical Hero ───────────────────────────────────────── */}
      <section>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-28 pt-24 lg:flex-row lg:items-center lg:gap-16 lg:pt-32">
          {/* Left 60% */}
          <div className="flex-[3] text-center lg:text-left">
            <p className="mb-5 inline-block rounded-full border border-foreground/10 bg-foreground/[0.03] px-4 py-1.5 text-xs font-medium text-muted dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
              Free. No account needed.
            </p>
            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
              Know the
              <br />
              <span className="font-serif italic text-accent">true cost</span>
              <br />
              of everything
              <br className="hidden sm:block" /> you buy abroad
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted lg:text-lg">
              Track your currency purchases. See your real blended exchange
              rate, fees included. That &#165;5,000 ramen? You&#39;ll know
              exactly what it costs.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Link
                href="/dashboard?guest=true"
                className="btn-shine inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-sm font-semibold text-white shadow-lg shadow-accent-glow transition-all hover:shadow-xl hover:shadow-accent-glow"
              >
                Try it Free
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card/50 px-8 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-card"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-8 text-xs text-muted/50">
              Runs in your browser. Your data stays on your device.
            </p>
          </div>

          {/* Right 40%: floating calculator */}
          <div className="hidden flex-[2] lg:block">
            <div className="animate-float rounded-2xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-black/[0.06] backdrop-blur-xl dark:bg-card/60 dark:shadow-black/20">
              <p className="text-sm font-medium text-muted">
                What does it cost me?
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5">
                  <span className="text-lg tabular-nums text-foreground">
                    5,000
                  </span>
                  <span className="ml-2 text-sm text-muted">JPY</span>
                </div>
                <span className="text-muted/40">&rarr;</span>
                <div className="flex-1 rounded-lg bg-accent/5 px-3 py-2.5 text-center">
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    34.88
                  </span>
                  <span className="ml-1 text-xs text-muted">USD</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-foreground/[0.02] px-3 py-2 dark:bg-foreground/5">
                  <p className="text-[10px] font-medium text-muted">Spent</p>
                  <p className="text-xs font-semibold tabular-nums text-foreground">
                    $300
                  </p>
                </div>
                <div className="rounded-lg bg-foreground/[0.02] px-3 py-2 dark:bg-foreground/5">
                  <p className="text-[10px] font-medium text-muted">
                    Received
                  </p>
                  <p className="text-xs font-semibold tabular-nums text-foreground">
                    &#165;43,000
                  </p>
                </div>
                <div className="rounded-lg bg-accent/5 px-3 py-2">
                  <p className="text-[10px] font-medium text-accent">Rate</p>
                  <p className="text-xs font-semibold tabular-nums text-foreground">
                    143.33
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento: How it works ─────────────────────────────────────── */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            How it works
          </h2>
          <p className="mx-auto mb-16 max-w-md text-center font-serif text-xl italic text-foreground/80">
            Three steps. Smarter travel money.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-shadow hover:shadow-lg dark:shadow-none dark:hover:shadow-none sm:col-span-2 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-2xl font-bold text-accent transition-transform duration-300 group-hover:scale-110">
                1
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Create a Trip
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Pick your home and target currencies. Heading to Japan? Set up
                  USD&nbsp;&rarr;&nbsp;JPY and you&#39;re ready to track every
                  exchange.
                </p>
              </div>
            </div>
            <div className="group rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-shadow hover:shadow-lg dark:shadow-none dark:hover:shadow-none">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl font-bold text-accent transition-transform duration-300 group-hover:scale-110">
                2
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Log Each Exchange
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Amount, rate, fees. Bought from Wise? Airport kiosk? Log it in
                seconds. We handle both inclusive and exclusive fee types.
              </p>
            </div>
            <div className="group rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-shadow hover:shadow-lg dark:shadow-none dark:hover:shadow-none">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl font-bold text-accent transition-transform duration-300 group-hover:scale-110">
                3
              </div>
              <h3 className="text-base font-semibold text-foreground">
                See Your True Rate
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Your blended DCA rate updates live. Type any foreign price and
                instantly see the real cost in your home currency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Features
          </h2>
          <p className="mx-auto mb-16 max-w-md text-center font-serif text-xl italic text-foreground/80">
            Built for travelers who buy smart
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z",
                iconColor: "text-emerald-600 dark:text-emerald-400",
                iconBg: "bg-emerald-500/10",
                title: "No Account Required",
                desc: "Start tracking right now as a guest. All data lives in your browser. Private. Instant.",
              },
              {
                icon: "M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z",
                iconColor: "text-accent",
                iconBg: "bg-accent/10",
                title: "True Blended Rate",
                desc: "Nominal rate vs. true rate after fees. See what that kiosk surcharge actually cost you.",
              },
              {
                icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z",
                iconColor: "text-violet-600 dark:text-violet-400",
                iconBg: "bg-violet-500/10",
                title: "Cloud Sync",
                desc: "Sign up to sync across devices. Your guest data migrates automatically.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-shadow hover:shadow-lg dark:shadow-none dark:hover:shadow-none"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${f.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-accent-glow`}
                >
                  <svg
                    className={`h-5 w-5 ${f.iconColor}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={f.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="font-serif text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl">
            Stop guessing. Start tracking.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted">
            Every currency purchase is a data point. Let your blended rate tell
            you the truth about your travel budget.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/dashboard?guest=true"
              className="btn-shine inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent px-8 text-sm font-semibold text-white shadow-lg shadow-accent-glow transition-all hover:shadow-xl hover:shadow-accent-glow sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border bg-card/50 px-8 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-card sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-2">
            <Logo className="opacity-40" />
            <span className="text-xs text-muted/50">Travel Exchange</span>
          </div>
          <span className="text-xs text-muted/50">
            100% free. No ads. No tracking.
          </span>
        </div>
      </footer>
    </div>
  );
}
