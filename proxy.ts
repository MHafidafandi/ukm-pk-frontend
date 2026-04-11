/**
 * Next.js Proxy (middleware) — lapisan pertahanan pertama untuk route protection.
 *
 * Proxy ini berjalan di Edge Runtime dan HANYA bisa membaca cookies.
 * Strategi:
 * - Cek keberadaan `has_token` cookie (di-set backend saat login, dihapus saat logout)
 * - Protected routes tanpa cookie → redirect ke /login
 * - Auth routes dengan cookie → redirect ke /dashboard
 *
 * CATATAN PENTING:
 * `has_token` adalah cookie NON-HttpOnly yang hanya menandakan "ada sesi aktif".
 * Refresh token yang sesungguhnya (HttpOnly) tidak bisa dibaca dari Edge Runtime.
 * Validasi sebenarnya terjadi di AuthProvider (silent refresh di client).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Route yang memerlukan autentikasi */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Route yang hanya bisa diakses tanpa login */
const AUTH_ROUTES = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek cookie is_authenticated yang diatur oleh sisi klien (atau cookie lain dari sisi backend)
  const hasToken =
    request.cookies.has("is_authenticated") ||
    request.cookies.has("has_token") ||
    request.cookies.has("refresh_token") ||
    request.cookies.has("refreshToken");

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Protected route tanpa cookie → redirect ke login
  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Auth route dengan cookie → redirect ke dashboard
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
