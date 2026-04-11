"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { LocalStorageService } from "@/lib/storage/local-storage";
import { SupabaseStorageService } from "@/lib/storage/supabase-storage";
import {
  hasLocalData,
  migrateLocalDataToSupabase,
} from "@/lib/storage/migration";
import type { StorageService } from "@/lib/storage/interface";

type StorageContextValue = {
  storage: StorageService;
  isGuest: boolean;
  userEmail: string | null;
};

const StorageContext = createContext<StorageContextValue | null>(null);

export function useStorage(): StorageContextValue {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage must be used within StorageProvider");
  return ctx;
}

export function StorageProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<StorageContextValue | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        // Migrate guest data if any exists in localStorage.
        // Runs before the provider reports "ready" so the dashboard
        // renders with migrated data already in Supabase.
        if (hasLocalData()) {
          try {
            await migrateLocalDataToSupabase(supabase, user.id);
          } catch {
            // Migration failed — local data is preserved for retry.
            // The user still gets the authenticated experience.
          }
        }

        setValue({
          storage: new SupabaseStorageService(supabase),
          isGuest: false,
          userEmail: user.email ?? null,
        });
      } else {
        setValue({
          storage: new LocalStorageService(),
          isGuest: true,
          userEmail: null,
        });
      }
    });
  }, []);

  if (!value) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted">
          <svg
            className="h-5 w-5 animate-spin"
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
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
}
