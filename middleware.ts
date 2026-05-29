import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/checkout", "/payment"];
const ADMIN_ROUTES = ["/admin"];
const STORE_MANAGER_ROUTES = ["/store-manager"];
const AUTH_ROUTES = ["/login"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return supabaseResponse;

  // Skip middleware for RSC prefetch requests to improve performance
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

  // Kalau belum login dan akses protected route → redirect ke login
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Kalau sudah login dan akses halaman login → redirect sesuai is_admin
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profile?.is_admin === true) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Proteksi halaman admin & store-manager: harus login dulu
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isStoreManagerRoute = STORE_MANAGER_ROUTES.some((r) => pathname.startsWith(r));

  if ((isAdminRoute || isStoreManagerRoute) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Cek is_admin untuk halaman admin & store-manager
  if ((isAdminRoute || isStoreManagerRoute) && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.is_admin === true;

    // Kedua halaman hanya boleh diakses oleh admin
    if (!isAdmin) {
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