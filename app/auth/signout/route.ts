import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const GUEST_COOKIE = "tec_guest_mode";

/**
 * Universal sign-out handler.
 * - Clears the Supabase session (authenticated users)
 * - Clears the guest cookie (guest users)
 * - Redirects to /login
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set(GUEST_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
