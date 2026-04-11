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

export interface StorageService {
  // -- Profile ---------------------------------------------------------------
  getProfile(): Promise<Profile | null>;
  updateProfile(data: UpdateProfileInput): Promise<Profile>;

  // -- Trips -----------------------------------------------------------------
  getTrips(): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip | null>;
  createTrip(data: CreateTripInput): Promise<Trip>;
  updateTrip(id: string, data: UpdateTripInput): Promise<Trip>;
  deleteTrip(id: string): Promise<void>;

  // -- Purchases -------------------------------------------------------------
  getPurchasesForTrip(tripId: string): Promise<Purchase[]>;
  addPurchase(data: CreatePurchaseInput): Promise<Purchase>;
  updatePurchase(id: string, data: UpdatePurchaseInput): Promise<Purchase>;
  deletePurchase(id: string): Promise<void>;
}
