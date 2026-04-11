import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Handles email confirmation links sent by Supabase Auth.
 * Default template links to: /auth/confirm?token_hash=xxx&type=signup
 *
 * Guest → authenticated data migration:
 * This route is server-side and cannot access localStorage. Migration
 * is handled client-side by the StorageProvider when it detects an
 * authenticated user with local data on the dashboard page load.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "recovery"
    | "email"
    | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=Could+not+verify+email", request.url),
  );
}
