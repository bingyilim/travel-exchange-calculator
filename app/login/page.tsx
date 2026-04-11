"use client";

import { createClient } from "@/lib/supabase/client";
import {
  hasLocalData,
  migrateLocalDataToSupabase,
} from "@/lib/storage/migration";
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

      // Migrate guest data before navigating to the dashboard.
      if (hasLocalData()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          try {
            await migrateLocalDataToSupabase(supabase, user.id);
          } catch {
            // Migration failed — StorageProvider will retry on dashboard load.
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

      // If email confirmation is disabled, the user gets a session immediately.
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

      // Email confirmation is enabled. User must verify first.
      setMessage("Check your email to confirm your account.");
      setLoading(false);
    }
  }

  function handleGuest() {
    router.push("/dashboard?guest=true");
  }

  const isLogin = mode === "login";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Travel Exchange
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Track your DCA currency purchases
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-foreground/10 bg-background p-6 shadow-sm">
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
                  : "text-foreground/50 hover:text-foreground/70"
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
                  : "text-foreground/50 hover:text-foreground/70"
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
                className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
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
                className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/30"
              />
            </div>

            {/* Feedback */}
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
              className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-foreground/10" />
            <span className="text-xs text-foreground/40">or</span>
            <div className="h-px flex-1 bg-foreground/10" />
          </div>

          {/* Guest mode */}
          <button
            type="button"
            onClick={handleGuest}
            className="w-full rounded-lg border border-foreground/10 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Continue as Guest
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-foreground/40">
          Guest data is stored locally on your device.
          <br />
          Sign up to sync across devices.
        </p>
      </div>
    </main>
  );
}
