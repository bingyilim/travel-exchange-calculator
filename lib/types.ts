// =============================================================================
// Domain types — mirror the PostgreSQL schema exactly.
// Used by both StorageService implementations and all UI components.
// =============================================================================

// -- Full model types (returned by reads) ------------------------------------

export type Profile = {
  id: string;
  display_name: string | null;
  default_home_currency: string;
  created_at: string;
  updated_at: string;
};

export type Trip = {
  id: string;
  user_id: string;
  name: string;
  home_currency: string;
  target_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Purchase = {
  id: string;
  trip_id: string;
  user_id: string;
  home_amount: number;
  foreign_amount: number;
  exchange_rate: number;
  fee_amount: number;
  purchased_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// -- Create DTOs (caller provides these; storage fills system fields) --------

export type CreateTripInput = {
  name: string;
  home_currency: string;
  target_currency: string;
};

export type CreatePurchaseInput = {
  trip_id: string;
  home_amount: number;
  foreign_amount: number;
  exchange_rate: number;
  fee_amount?: number;
  purchased_at?: string;
  notes?: string;
};

// -- Update DTOs (all fields optional) ---------------------------------------

export type UpdateProfileInput = {
  display_name?: string;
  default_home_currency?: string;
};

export type UpdateTripInput = {
  name?: string;
  home_currency?: string;
  target_currency?: string;
  is_active?: boolean;
};

export type UpdatePurchaseInput = {
  home_amount?: number;
  foreign_amount?: number;
  exchange_rate?: number;
  fee_amount?: number;
  purchased_at?: string;
  notes?: string | null;
};
