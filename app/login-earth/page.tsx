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

export default function LoginEarthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isLogin) {
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
            // StorageProvider will retry.
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
            // StorageProvider will retry.
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

  return (
    <main className="min-h-dvh bg-background">
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[1.2fr_1fr]">
        {/* ── LEFT: Globe ─────────────────────────────────────────── */}
        <section className="relative flex items-center justify-center px-6 py-10 md:py-14">
          {/* Overlay */}
          <div className="absolute left-6 top-6 md:left-10 md:top-10 z-10">
            <p
              className="font-mono uppercase text-muted whitespace-nowrap"
              style={{ fontSize: 10, letterSpacing: "0.22em" }}
            >
              Live network
            </p>
            <p
              className="mt-1 font-serif italic text-foreground whitespace-nowrap"
              style={{ fontSize: 20 }}
            >
              USD to JPY · MYR to KRW
            </p>
            <p
              className="mt-1 font-mono uppercase text-muted whitespace-nowrap"
              style={{ fontSize: 10, letterSpacing: "0.22em" }}
            >
              24 currencies · 8 cities
            </p>
          </div>

          <Globe />
        </section>

        {/* ── RIGHT: Form ─────────────────────────────────────────── */}
        <section className="flex items-center justify-center bg-card border-t-[1.5px] md:border-t-0 md:border-l-[1.5px] border-foreground px-8 py-10 md:px-14 md:py-14">
          <div className="w-full max-w-[380px]">
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-stamp mb-4">
              {isLogin ? "Re-entry" : "New traveller"}
            </div>
            <h1
              className="font-serif italic text-accent leading-[1.05] tracking-tight"
              style={{ fontSize: 44 }}
            >
              {isLogin ? "Welcome back." : "Join the network."}
            </h1>
            <p className="mt-3 font-serif italic text-sm text-muted">
              {isLogin
                ? "Sign in and pick up wherever you left off."
                : "Open a ledger and chart your routes."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <UnderlineField
                id="earth-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                required
              />
              <UnderlineField
                id="earth-password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                minLength={6}
              />

              {error && (
                <p className="bg-destructive/10 border-l-2 border-destructive px-3 py-2 font-serif text-sm text-destructive">
                  {error}
                </p>
              )}
              {message && (
                <p className="bg-accent/10 border-l-2 border-accent px-3 py-2 font-serif text-sm text-foreground">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-doc w-full disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--accent)",
                  color: "var(--background)",
                  borderColor: "var(--accent)",
                }}
              >
                {loading
                  ? isLogin
                    ? "Signing in…"
                    : "Creating…"
                  : isLogin
                    ? "Sign in →"
                    : "Create account →"}
              </button>

              <button
                type="button"
                onClick={handleGuest}
                className="w-full font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted hover:text-foreground border-[1.5px] border-border hover:border-foreground/40 py-3 transition-colors"
              >
                Continue as guest
              </button>
            </form>

            <p className="mt-6 font-serif italic text-xs text-muted">
              {isLogin ? "First time here? " : "Already have a ledger? "}
              <button
                type="button"
                onClick={() => switchMode(isLogin ? "signup" : "login")}
                className="not-italic font-mono text-[10px] uppercase tracking-[0.18em] text-stamp border-b border-dashed border-stamp hover:text-foreground hover:border-foreground transition-colors"
              >
                {isLogin ? "Open a ledger" : "Sign in"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Globe — wireframe + currency arcs (pure SVG)
// ─────────────────────────────────────────────────────────────────────────

const LONGITUDES = [0, 30, 60, 90, 120, 150];
const LATITUDES = [-60, -30, 0, 30, 60];

const ARCS = [
  "M -65 -45 Q 0 -120 75 -25",
  "M -75 30 Q -10 -100 80 35",
  "M -45 60 Q 30 -10 70 -55",
  "M -20 -75 Q 60 0 30 70",
];

const CITIES: Array<[number, number]> = [
  [-65, -45],
  [75, -25],
  [-75, 30],
  [80, 35],
  [-45, 60],
  [70, -55],
  [-20, -75],
  [30, 70],
];

function Globe() {
  return (
    <div
      className="relative aspect-square w-[200px] sm:w-[420px] md:w-[500px]"
      aria-hidden
    >
      {/* Bottom: rotating wireframe */}
      <svg
        viewBox="-110 -110 220 220"
        className="absolute inset-0 w-full h-full text-foreground animate-globe-spin"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          opacity={0.85}
        >
          {/* Outer */}
          <circle cx={0} cy={0} r={100} strokeWidth={1} />

          {/* Longitudes */}
          {LONGITUDES.map((angle) => {
            const rx = Math.abs(Math.cos((angle * Math.PI) / 180)) * 100;
            return (
              <ellipse
                key={`lon-${angle}`}
                cx={0}
                cy={0}
                rx={rx}
                ry={100}
              />
            );
          })}

          {/* Latitudes */}
          {LATITUDES.map((lat) => {
            const cy = Math.sin((lat * Math.PI) / 180) * 100;
            const rx = Math.cos((lat * Math.PI) / 180) * 100;
            return (
              <ellipse
                key={`lat-${lat}`}
                cx={0}
                cy={cy}
                rx={rx}
                ry={6}
                opacity={0.5}
              />
            );
          })}
        </g>
      </svg>

      {/* Top: arcs + city dots (no rotation) */}
      <svg
        viewBox="-110 -110 220 220"
        className="absolute inset-0 w-full h-full"
      >
        <g stroke="var(--stamp)" fill="none" opacity={0.6}>
          {ARCS.map((d, i) => (
            <path
              key={`arc-${i}`}
              d={d}
              strokeWidth={1.2}
              strokeDasharray="4 6"
              className="animate-dash-march"
            />
          ))}
        </g>
        <g fill="var(--stamp)">
          {CITIES.map(([cx, cy], i) => (
            <circle
              key={`city-${i}`}
              cx={cx}
              cy={cy}
              r={3.5}
              className="animate-city-pulse"
              style={{ animationDelay: `${(i % 4) * 0.6}s` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// UnderlineField — transparent input w/ hairline bottom border
// ─────────────────────────────────────────────────────────────────────────

function UnderlineField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted"
      >
        {label}
      </label>
      <div className="flex items-end gap-2 border-b-[1.5px] border-foreground pb-1.5 focus-within:border-foreground transition-colors">
        <input
          id={id}
          type={inputType}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent border-none outline-none font-mono text-sm text-foreground placeholder:text-muted/40 py-1"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="shrink-0 pb-0.5 text-muted hover:text-foreground transition-colors"
          >
            {visible ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        )}
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.04 12.32a1.01 1.01 0 0 1 0-.64C3.43 7.51 7.36 4.5 12 4.5c4.64 0 8.57 3.01 9.96 7.18.07.21.07.43 0 .64-1.39 4.17-5.32 7.18-9.96 7.18-4.64 0-8.57-3.01-9.96-7.18Z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.98 8.22A10.48 10.48 0 0 0 1.93 12c1.3 4.34 5.31 7.5 10.07 7.5.99 0 1.95-.14 2.86-.4M6.23 6.23A10.45 10.45 0 0 1 12 4.5c4.76 0 8.77 3.16 10.07 7.5a10.52 10.52 0 0 1-4.3 5.77M6.23 6.23 3 3m3.23 3.23 3.65 3.65m7.89 7.89L21 21m-3.23-3.23-3.65-3.65m0 0a3 3 0 1 0-4.24-4.24m4.24 4.24L9.88 9.88" />
    </svg>
  );
}
