import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/checkout", "/payment"];
const CONTROL_ROUTES = ["/control", "/admin", "/store-manager"];
const AUTH_ROUTES = ["/login"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return supabaseResponse;

  // Skip RSC prefetch requests
  const isRSCRequest = request.headers.get("RSC") === "1";
  if (isRSCRequest) return supabaseResponse;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Redirect /admin and /store-manager to /control
  if (pathname.startsWith("/admin") || pathname.startsWith("/store-manager")) {
    return NextResponse.redirect(new URL("/control", request.url));
  }

  // Protected routes — must be logged in
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Login page — redirect based on role if already logged in
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    if (role === "admin" || role === "store_manager" || role === "superadmin") {
      return NextResponse.redirect(new URL("/control", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Control page — must be logged in and have correct role
  const isControlRoute = pathname.startsWith("/control");
  if (isControlRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isControlRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const allowedRoles = ["admin", "store_manager", "superadmin"];

    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};