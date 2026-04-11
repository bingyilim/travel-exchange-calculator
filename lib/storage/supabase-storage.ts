import type { SupabaseClient } from "@supabase/supabase-js";
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

// =============================================================================
// Helper
// =============================================================================

/**
 * Unwrap a Supabase query result. Throws a descriptive error on failure
 * so callers never have to null-check `.error` themselves.
 */
function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) {
    const message =
      result.error instanceof Error
        ? result.error.message
        : String(result.error);
    throw new Error(message);
  }
  return result.data as T;
}

// =============================================================================
// SupabaseStorageService
// =============================================================================

export class SupabaseStorageService implements StorageService {
  constructor(private supabase: SupabaseClient) {}

  /** Returns the authenticated user's ID, or throws. */
  private async userId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return user.id;
  }

  // -- Profile ---------------------------------------------------------------

  async getProfile(): Promise<Profile | null> {
    const uid = await this.userId();
    const { data, error } = await this.supabase
      .from("profiles")
      .select()
      .eq("id", uid)
      .single();

    // PGRST116 = "no rows returned" — valid for a missing profile.
    if (error && error.code === "PGRST116") return null;
    if (error) throw new Error(error.message);
    return data as Profile;
  }

  async updateProfile(data: UpdateProfileInput): Promise<Profile> {
    const uid = await this.userId();
    return unwrap(
      await this.supabase
        .from("profiles")
        .update(data)
        .eq("id", uid)
        .select()
        .single(),
    );
  }

  // -- Trips -----------------------------------------------------------------

  async getTrips(): Promise<Trip[]> {
    return unwrap(
      await this.supabase
        .from("trips")
        .select()
        .order("created_at", { ascending: false }),
    );
  }

  async getTrip(id: string): Promise<Trip | null> {
    const { data, error } = await this.supabase
      .from("trips")
      .select()
      .eq("id", id)
      .single();

    if (error && error.code === "PGRST116") return null;
    if (error) throw new Error(error.message);
    return data as Trip;
  }

  async createTrip(data: CreateTripInput): Promise<Trip> {
    const uid = await this.userId();
    return unwrap(
      await this.supabase
        .from("trips")
        .insert({ ...data, user_id: uid })
        .select()
        .single(),
    );
  }

  async updateTrip(id: string, data: UpdateTripInput): Promise<Trip> {
    return unwrap(
      await this.supabase
        .from("trips")
        .update(data)
        .eq("id", id)
        .select()
        .single(),
    );
  }

  async deleteTrip(id: string): Promise<void> {
    // Cascade delete of purchases is handled by the DB foreign key.
    unwrap(await this.supabase.from("trips").delete().eq("id", id));
  }

  // -- Purchases -------------------------------------------------------------

  async getPurchasesForTrip(tripId: string): Promise<Purchase[]> {
    return unwrap(
      await this.supabase
        .from("purchases")
        .select()
        .eq("trip_id", tripId)
        .order("purchased_at", { ascending: false }),
    );
  }

  async addPurchase(data: CreatePurchaseInput): Promise<Purchase> {
    const uid = await this.userId();
    return unwrap(
      await this.supabase
        .from("purchases")
        .insert({ ...data, user_id: uid })
        .select()
        .single(),
    );
  }

  async updatePurchase(
    id: string,
    data: UpdatePurchaseInput,
  ): Promise<Purchase> {
    return unwrap(
      await this.supabase
        .from("purchases")
        .update(data)
        .eq("id", id)
        .select()
        .single(),
    );
  }

  async deletePurchase(id: string): Promise<void> {
    unwrap(await this.supabase.from("purchases").delete().eq("id", id));
  }
}
