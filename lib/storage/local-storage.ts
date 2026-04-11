import type {
  Profile,
  Trip,
  Purchase,
  CreateTripInput,
  CreatePurchaseInput,
  UpdateProfileInput,
  UpdateTripInput,
  UpdatePurchaseInput,
} from "@/lib/types";
import type { StorageService } from "./interface";

// Key prefix prevents collisions with other apps on the same origin.
const KEYS = {
  profile: "tec_profile",
  trips: "tec_trips",
  purchases: "tec_purchases",
  guestUserId: "tec_guest_user_id",
} as const;

// =============================================================================
// Helpers
// =============================================================================

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Returns a stable UUID for the guest user. Generated once, then persisted
 * so that all guest records share the same user_id. This makes the
 * localStorage data structure identical to what Supabase stores.
 */
function getGuestUserId(): string {
  let id = localStorage.getItem(KEYS.guestUserId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.guestUserId, id);
  }
  return id;
}

// =============================================================================
// LocalStorageService
// =============================================================================

export class LocalStorageService implements StorageService {
  // -- Profile ---------------------------------------------------------------

  async getProfile(): Promise<Profile | null> {
    return readJson<Profile | null>(KEYS.profile, null);
  }

  async updateProfile(data: UpdateProfileInput): Promise<Profile> {
    const now = nowISO();
    const existing = readJson<Profile | null>(KEYS.profile, null);

    const profile: Profile = existing
      ? { ...existing, ...data, updated_at: now }
      : {
          id: getGuestUserId(),
          display_name: data.display_name ?? null,
          default_home_currency: data.default_home_currency ?? "USD",
          created_at: now,
          updated_at: now,
        };

    writeJson(KEYS.profile, profile);
    return profile;
  }

  // -- Trips -----------------------------------------------------------------

  async getTrips(): Promise<Trip[]> {
    return readJson<Trip[]>(KEYS.trips, []);
  }

  async getTrip(id: string): Promise<Trip | null> {
    const trips = readJson<Trip[]>(KEYS.trips, []);
    return trips.find((t) => t.id === id) ?? null;
  }

  async createTrip(data: CreateTripInput): Promise<Trip> {
    const now = nowISO();
    const trip: Trip = {
      id: crypto.randomUUID(),
      user_id: getGuestUserId(),
      name: data.name,
      home_currency: data.home_currency,
      target_currency: data.target_currency,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    const trips = readJson<Trip[]>(KEYS.trips, []);
    trips.push(trip);
    writeJson(KEYS.trips, trips);
    return trip;
  }

  async updateTrip(id: string, data: UpdateTripInput): Promise<Trip> {
    const trips = readJson<Trip[]>(KEYS.trips, []);
    const index = trips.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error(`Trip not found: ${id}`);
    }

    trips[index] = { ...trips[index], ...data, updated_at: nowISO() };
    writeJson(KEYS.trips, trips);
    return trips[index];
  }

  async deleteTrip(id: string): Promise<void> {
    // Cascade: remove all purchases belonging to this trip.
    const purchases = readJson<Purchase[]>(KEYS.purchases, []);
    writeJson(
      KEYS.purchases,
      purchases.filter((p) => p.trip_id !== id),
    );

    const trips = readJson<Trip[]>(KEYS.trips, []);
    writeJson(
      KEYS.trips,
      trips.filter((t) => t.id !== id),
    );
  }

  // -- Purchases -------------------------------------------------------------

  async getPurchasesForTrip(tripId: string): Promise<Purchase[]> {
    const purchases = readJson<Purchase[]>(KEYS.purchases, []);
    return purchases.filter((p) => p.trip_id === tripId);
  }

  async addPurchase(data: CreatePurchaseInput): Promise<Purchase> {
    const now = nowISO();
    const purchase: Purchase = {
      id: crypto.randomUUID(),
      trip_id: data.trip_id,
      user_id: getGuestUserId(),
      home_amount: data.home_amount,
      foreign_amount: data.foreign_amount,
      exchange_rate: data.exchange_rate,
      fee_amount: data.fee_amount ?? 0,
      purchased_at: data.purchased_at ?? now,
      notes: data.notes ?? null,
      created_at: now,
      updated_at: now,
    };

    const purchases = readJson<Purchase[]>(KEYS.purchases, []);
    purchases.push(purchase);
    writeJson(KEYS.purchases, purchases);
    return purchase;
  }

  async updatePurchase(
    id: string,
    data: UpdatePurchaseInput,
  ): Promise<Purchase> {
    const purchases = readJson<Purchase[]>(KEYS.purchases, []);
    const index = purchases.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Purchase not found: ${id}`);
    }

    purchases[index] = { ...purchases[index], ...data, updated_at: nowISO() };
    writeJson(KEYS.purchases, purchases);
    return purchases[index];
  }

  async deletePurchase(id: string): Promise<void> {
    const purchases = readJson<Purchase[]>(KEYS.purchases, []);
    writeJson(
      KEYS.purchases,
      purchases.filter((p) => p.id !== id),
    );
  }
}
