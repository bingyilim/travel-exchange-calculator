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

export default function LoginCoverPage() {
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
    <main className="min-h-dvh bg-background grid grid-cols-1 md:grid-cols-2 md:[&>*+*]:border-l-[1.5px] md:[&>*+*]:border-foreground">
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* ── LEFT: Cover page ─────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-between bg-card overflow-hidden border-b-[1.5px] md:border-b-0 border-foreground min-h-[220px] md:min-h-dvh px-6 py-10 md:px-14 md:py-14">
        {/* Radial gradient washes — leather feel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 25% 30%, var(--stamp) 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, var(--accent) 0%, transparent 60%)",
            opacity: 0.06,
          }}
        />

        {/* Ribbon bookmark */}
        <div
          aria-hidden
          className="absolute top-0 hidden md:block"
          style={{
            right: 56,
            width: 28,
            height: 90,
            background: "var(--stamp)",
            clipPath:
              "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
            boxShadow: "2px 4px 8px rgba(0,0,0,0.18)",
          }}
        />

        {/* Masthead */}
        <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          <span>Travel Exchange</span>
          <span>Vol. III · 2026</span>
        </div>

        {/* Emblem (centered) */}
        <div className="relative flex flex-1 items-center justify-center py-8 md:py-0">
          <div className="relative">
            {/* Top arc text */}
            <p
              className="absolute left-1/2 -translate-x-1/2 font-mono uppercase whitespace-nowrap text-foreground/70"
              style={{
                top: 22,
                fontSize: 9,
                letterSpacing: "0.32em",
              }}
            >
              Ex itinere et numero
            </p>

            {/* Outer circle */}
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 220,
                height: 220,
                border: "2.5px solid var(--foreground)",
              }}
            >
              {/* Inner concentric circle */}
              <div
                className="absolute rounded-full"
                style={{
                  inset: 12,
                  border: "1px solid var(--foreground)",
                  opacity: 0.45,
                }}
              />
              {/* Center glyph */}
              <span
                className="font-serif italic text-foreground leading-none"
                style={{ fontSize: 92 }}
              >
                Tx
              </span>
            </div>

            {/* Bottom arc text */}
            <p
              className="absolute left-1/2 -translate-x-1/2 font-mono uppercase whitespace-nowrap text-foreground/70"
              style={{
                bottom: 22,
                fontSize: 9,
                letterSpacing: "0.32em",
              }}
            >
              2025 · Edition III
            </p>
          </div>
        </div>

        {/* Frontispiece — hidden on mobile per spec */}
        <div className="relative hidden md:block text-center max-w-md mx-auto">
          <p
            className="font-serif italic text-foreground leading-snug"
            style={{ fontSize: 18, opacity: 0.78 }}
          >
            &ldquo;Keep faithful records, every line you write is a trip you
            will remember.&rdquo;
          </p>
          <p
            className="mt-3 font-mono uppercase text-muted/70"
            style={{ fontSize: 9, letterSpacing: "0.22em" }}
          >
            — Frontispiece
          </p>
        </div>
      </section>

      {/* ── RIGHT: Form page ─────────────────────────────────────────── */}
      <section className="flex items-center justify-center bg-background px-8 py-10 md:px-14 md:py-14">
        <div className="w-full max-w-[380px]">
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-stamp mb-4">
            {isLogin ? "Re-entry" : "First entry"}
          </div>
          <h1
            className="font-serif italic text-accent leading-[1.05] tracking-tight"
            style={{ fontSize: 44 }}
          >
            {isLogin ? "Welcome back." : "A fresh volume."}
          </h1>
          <p className="mt-3 font-serif italic text-sm text-muted">
            {isLogin
              ? "Open the ledger you left off on."
              : "Begin a new edition of your travels."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <UnderlineField
              id="cover-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <UnderlineField
              id="cover-password"
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
                  : "Open volume →"}
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
              {isLogin ? "Open a fresh ledger" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
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
