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

export default function LoginCompassPage() {
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
      <div className="fixed right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-6 py-16 md:px-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* ── LEFT: Compass ─────────────────────────────────────────── */}
          <div className="flex justify-center md:justify-end">
            <CompassDial />
          </div>

          {/* ── RIGHT: Form ───────────────────────────────────────────── */}
          <div className="w-full max-w-[380px] mx-auto md:mx-0">
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-stamp mb-4">
              {isLogin ? "Re-entry" : "New entry"}
            </div>
            <h1 className="font-serif italic text-4xl sm:text-5xl text-accent leading-[1.05] tracking-tight">
              {isLogin ? "Welcome back." : "Chart a new course."}
            </h1>
            <p className="mt-3 font-serif italic text-sm text-muted">
              {isLogin
                ? "Sign in to resume your trips and exchange ledger."
                : "Open a fresh ledger and plot your first bearing."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <UnderlineField
                id="compass-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                required
              />
              <UnderlineField
                id="compass-password"
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
                    : "Open ledger →"}
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
              {isLogin ? "First time here?" : "Already have a ledger?"}
              <button
                type="button"
                onClick={() => switchMode(isLogin ? "signup" : "login")}
                className="ml-2 not-italic font-mono text-[10px] uppercase tracking-[0.18em] text-stamp border-b border-dashed border-stamp hover:text-foreground hover:border-foreground transition-colors"
              >
                {isLogin ? "Open a ledger" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CompassDial — pure CSS/SVG dial with a swaying needle
// ─────────────────────────────────────────────────────────────────────────

function CompassDial() {
  // 24 ticks at 15° apart
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative aspect-square w-[200px] sm:w-[420px] md:w-[460px]"
        aria-hidden
      >
        {/* Outer dial */}
        <div className="absolute inset-0 rounded-full border-[1.5px] border-foreground bg-card" />
        {/* Inner solid hairline */}
        <div className="absolute inset-[10%] rounded-full border border-foreground/30" />
        {/* Inner dashed hairline */}
        <div
          className="absolute inset-[20%] rounded-full"
          style={{
            border: "1px dashed var(--foreground)",
            opacity: 0.25,
          }}
        />

        {/* 24 tick marks */}
        {ticks.map((deg) => (
          <div
            key={deg}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${deg}deg)`,
              width: 1,
              height: "100%",
            }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 bg-foreground"
              style={{ top: 6, width: 1, height: 8 }}
            />
          </div>
        ))}

        {/* Cardinal letters */}
        <CardinalLetter letter="N" position="top-3 left-1/2 -translate-x-1/2" />
        <CardinalLetter
          letter="E"
          position="right-3 top-1/2 -translate-y-1/2"
        />
        <CardinalLetter
          letter="S"
          position="bottom-3 left-1/2 -translate-x-1/2"
        />
        <CardinalLetter letter="W" position="left-3 top-1/2 -translate-y-1/2" />

        {/* Needle (animates 47° → 52°) */}
        <div className="absolute inset-0 animate-compass-sway">
          {/* Top half — stamp red tip */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 4,
              height: "35%",
              transform: "translate(-50%, -100%)",
              background: "var(--stamp)",
              clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
            }}
          />
          {/* Bottom half — navy tail */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 4,
              height: "35%",
              transform: "translate(-50%, 0)",
              background: "var(--accent)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          />
        </div>

        {/* Pivot */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full bg-background"
          style={{
            width: 16,
            height: 16,
            transform: "translate(-50%, -50%)",
            border: "2px solid var(--foreground)",
          }}
        />
      </div>

      {/* Readout — 64px below the dial */}
      <div className="mt-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stamp">
          Bearing 047°
        </p>
        <p className="mt-1.5 font-serif italic text-sm text-muted">
          USD to JPY
        </p>
      </div>
    </div>
  );
}

function CardinalLetter({
  letter,
  position,
}: {
  letter: string;
  position: string;
}) {
  return (
    <span
      className={`absolute ${position} font-serif italic text-[24px] text-foreground leading-none select-none`}
    >
      {letter}
    </span>
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
