import type { SupabaseClient } from "@supabase/supabase-js";
import type { Trip, Purchase } from "@/lib/types";

// Must match the keys in local-storage.ts.
const KEYS = {
  profile: "tec_profile",
  trips: "tec_trips",
  purchases: "tec_purchases",
  guestUserId: "tec_guest_user_id",
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Checks whether localStorage contains any guest data worth migrating.
 * Cheap to call — no network, no parsing beyond a null check.
 */
export function hasLocalData(): boolean {
  return (
    localStorage.getItem(KEYS.trips) !== null ||
    localStorage.getItem(KEYS.purchases) !== null
  );
}

/**
 * Migrates all guest data from localStorage into the authenticated user's
 * Supabase account. Returns true if data was migrated, false if there was
 * nothing to migrate.
 *
 * On success, all local keys are cleared.
 * On failure, local keys are preserved so the user can retry.
 */
export async function migrateLocalDataToSupabase(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const localTrips = readJson<Trip[]>(KEYS.trips, []);
  const localPurchases = readJson<Purchase[]>(KEYS.purchases, []);

  if (localTrips.length === 0 && localPurchases.length === 0) {
    console.log("[migration] No local data to migrate.");
    return false;
  }

  console.log(
    `[migration] Starting: ${localTrips.length} trip(s), ${localPurchases.length} purchase(s).`,
  );

  try {
    // -- 1. Migrate trips, building a local-ID → cloud-ID map ----------------
    const tripIdMap = new Map<string, string>();

    for (const trip of localTrips) {
      console.log(`[migration] Inserting trip "${trip.name}"...`);

      const { data, error } = await supabase
        .from("trips")
        .insert({
          user_id: userId,
          name: trip.name,
          home_currency: trip.home_currency,
          target_currency: trip.target_currency,
          is_active: trip.is_active,
          created_at: trip.created_at,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(
          `Failed to migrate trip "${trip.name}": ${error.message}`,
        );
      }

      tripIdMap.set(trip.id, data.id);
      console.log(
        `[migration] Trip "${trip.name}": ${trip.id} → ${data.id}`,
      );
    }

    // -- 2. Migrate purchases, re-mapping trip IDs ---------------------------
    for (const purchase of localPurchases) {
      const cloudTripId = tripIdMap.get(purchase.trip_id);

      if (!cloudTripId) {
        console.warn(
          `[migration] Skipping orphan purchase ${purchase.id} (local trip ${purchase.trip_id} not in map).`,
        );
        continue;
      }

      const { error } = await supabase.from("purchases").insert({
        user_id: userId,
        trip_id: cloudTripId,
        home_amount: purchase.home_amount,
        foreign_amount: purchase.foreign_amount,
        exchange_rate: purchase.exchange_rate,
        fee_amount: purchase.fee_amount ?? 0,
        purchased_at: purchase.purchased_at,
        notes: purchase.notes,
        created_at: purchase.created_at,
      });

      if (error) {
        throw new Error(`Failed to migrate purchase: ${error.message}`);
      }

      console.log(
        `[migration] Purchase migrated → trip ${cloudTripId}`,
      );
    }

    // -- 3. Clean up localStorage --------------------------------------------
    localStorage.removeItem(KEYS.trips);
    localStorage.removeItem(KEYS.purchases);
    localStorage.removeItem(KEYS.profile);
    localStorage.removeItem(KEYS.guestUserId);

    console.log("[migration] Complete. Local data cleared.");
    return true;
  } catch (err) {
    // Local data is preserved so the user can retry on next login.
    console.error("[migration] Failed — local data preserved for retry.", err);
    throw err;
  }
}
