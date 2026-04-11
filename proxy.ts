import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const GUEST_COOKIE = "tec_guest_mode";
const GUEST_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const PROTECTED_PREFIXES = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── Guest activation ─────────────────────────────────────────────────
  // ?guest=true on any URL: set the guest cookie and redirect to the
  // clean URL. The cookie will be present on the redirected request.
  if (searchParams.get("guest") === "true") {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("guest");
    const response = NextResponse.redirect(clean);
    response.cookies.set(GUEST_COOKIE, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: GUEST_MAX_AGE,
    });
    return response;
  }

  const isGuest = request.cookies.has(GUEST_COOKIE);

  // ── Supabase session refresh ─────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() validates the JWT with the Auth server.
  // getSession() only reads cookies — never use it for authorization.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Mutual exclusivity ───────────────────────────────────────────────
  // A user who logs in while holding a guest cookie has "upgraded."
  // Clear the guest cookie so they are purely authenticated from now on.
  if (user && isGuest) {
    supabaseResponse.cookies.set(GUEST_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    });
  }

  // ── Login page redirect ──────────────────────────────────────────────
  // Authenticated users on /login → send to dashboard.
  // Guests on /login → let them through (they may want to sign up).
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ── Route protection ─────────────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !user && !isGuest) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all routes except static assets and Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
