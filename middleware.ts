import NextAuth from "next-auth"
import { AuthConfig } from "./auth"
import { NextResponse } from "next/server"

const { auth: authMiddleware } = NextAuth(AuthConfig)

export default authMiddleware((request) => {
  // Skip middleware for non-page routes
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|svg|ico)$/)) {
    return NextResponse.next()
  }

  const isLoggedIn = !!request.auth
  const { nextUrl } = request

  // Auth routes that logged-in users shouldn't access
  const isAuthRoute = ['/login', '/register'].includes(nextUrl.pathname)

  // Protected routes check
  const isProtectedRoute = nextUrl.pathname.startsWith('/(protected)')

  // Redirect logged in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Redirect non-logged in users from protected routes
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const routeMatcher = {
  matcher: [
    // Only match specific routes we care about
    '/(protected)/:path*',
    '/login',
    '/register'
  ]
}