import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware for Next.js
 *
 * NOTE: Edge Runtime middleware cannot use Prisma Client.
 * Route protection is handled by:
 * 1. Server Components using requireAuth() and requireAdmin()
 * 2. Server Actions using requireAuth() and requireAdmin()
 *
 * This middleware is kept minimal to avoid Edge Runtime compatibility issues.
 */
export async function middleware(_request: NextRequest) {
  // Currently no middleware logic - all protection is done in Server Components/Actions
  // This file is kept for future enhancements that work with Edge Runtime
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};
