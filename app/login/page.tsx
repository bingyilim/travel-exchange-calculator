"use client";

import { createClient } from "@/lib/supabase/client";
import {
  hasLocalData,
  migrateLocalDataToSupabase,
} from "@/lib/storage/migration";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (hasLocalData()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          try {
            await migrateLocalDataToSupabase(supabase, user.id);
          } catch {
            // StorageProvider will retry on dashboard load.
          }
        }
      }

      router.push("/dashboard");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        if (hasLocalData() && data.user) {
          try {
            await migrateLocalDataToSupabase(supabase, data.user.id);
          } catch {
            // StorageProvider will retry on dashboard load.
          }
        }
        router.push("/dashboard");
        return;
      }

      setMessage("Check your email to confirm your account.");
      setLoading(false);
    }
  }

  function handleGuest() {
    router.push("/dashboard?guest=true");
  }

  const isLogin = mode === "login";

  return (
    <main className="flex min-h-dvh bg-background">
      {/* ── Left: Form ──────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 lg:px-12">
        <div className="fixed right-4 top-4 z-10 lg:hidden">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-6 w-8">
                <span className="absolute left-0 top-0.5 h-5 w-5 rounded-full border-2 border-accent opacity-60" />
                <span className="absolute right-0 top-0.5 h-5 w-5 rounded-full border-2 border-accent" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Travel Exchange
              </span>
            </div>
            <h2 className="mt-8 font-serif text-2xl font-bold italic text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {isLogin
                ? "Sign in to access your trips and exchange history."
                : "Start tracking your currency purchases for free."}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="mb-6 flex rounded-lg bg-foreground/5 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground/70"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                !isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground/70"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white shadow-md shadow-accent-glow transition-all hover:shadow-lg hover:shadow-accent-glow disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted/60">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Continue as Guest
          </button>

          <p className="mt-6 text-xs text-muted/50">
            Guest data is stored locally on your device. Sign up to sync.
          </p>
        </div>
      </div>

      {/* ── Right: Brand panel (desktop only) ───────────────────────── */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[#eef2ff] dark:bg-[#0f172a]" />
        <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/8" />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-violet-400/10 blur-[100px] dark:bg-violet-500/6" />

        <div className="relative flex h-full flex-col items-center justify-center px-12">
          <ThemeToggle />

          {/* Decorative rate card */}
          <div className="mt-8 w-full max-w-xs rounded-2xl border border-foreground/5 bg-white/60 p-6 shadow-lg shadow-black/[0.03] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <p className="text-xs font-medium text-muted dark:text-white/50">
              Your Blended Rate
            </p>
            <p className="mt-2 text-4xl font-bold tabular-nums text-foreground dark:text-white">
              143.33
            </p>
            <p className="mt-1 text-sm text-muted dark:text-white/40">
              JPY per USD
            </p>
            <div className="mt-5 h-px bg-border dark:bg-white/10" />
            <div className="mt-4 flex justify-between text-xs">
              <div>
                <p className="text-muted dark:text-white/40">Spent</p>
                <p className="mt-0.5 font-semibold tabular-nums text-foreground/80 dark:text-white/80">
                  $300.00
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted dark:text-white/40">Received</p>
                <p className="mt-0.5 font-semibold tabular-nums text-foreground/80 dark:text-white/80">
                  &#165;43,000
                </p>
              </div>
            </div>
          </div>

          <p className="mt-10 max-w-xs text-center font-serif text-lg italic leading-relaxed text-foreground/50 dark:text-white/70">
            &ldquo;The real exchange rate is the one that includes your
            fees.&rdquo;
          </p>
          <p className="mt-3 text-xs text-muted/50 dark:text-white/30">
            Travel Exchange Calculator
          </p>
        </div>
      </div>
    </main>
  );
}
