import NextAuth from "next-auth"
import { AuthConfig } from "./auth"
import { NextResponse } from "next/server"

const { auth: authMiddleware } = NextAuth(AuthConfig)

// Get the hostname from NEXTAUTH_URL
let authUrlHostname = null
try {
  if (process.env.NEXTAUTH_URL) {
    authUrlHostname = new URL(process.env.NEXTAUTH_URL).hostname
  }
} catch (e) {
  console.warn("Failed to parse NEXTAUTH_URL", e)
}

// List of allowed hostnames for system API access
const ALLOWED_HOSTS = ['localhost', '127.0.0.1']

// Add the NEXTAUTH_URL hostname if it exists and isn't already in the list
if (authUrlHostname && !ALLOWED_HOSTS.includes(authUrlHostname)) {
  ALLOWED_HOSTS.push(authUrlHostname)
}

export default authMiddleware(async (request) => {
  // Protect /api/system routes with origin check
  if (request.nextUrl.pathname.startsWith('/api/system')) {
    // Get request origin information
    const host = request.headers.get('host') || ''
    const hostname = host.split(':')[0] // Remove port if present
    
    // Check if request is from allowed hosts
    if (!ALLOWED_HOSTS.includes(hostname)) {
      console.warn(`Unauthorized system API access attempt from: ${hostname}, allowed: ${ALLOWED_HOSTS.join(', ')}`)
      return new NextResponse(
        JSON.stringify({ error: "System API only available from allowed hosts" }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      )
    }
  }

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
    return NextResponse.redirect(new URL('/overview', nextUrl))
  }

  // Redirect non-logged in users from protected routes
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

// Combine your matchers
export const config = {
  matcher: [
    '/(protected)/:path*',
    '/login',
    '/register',
    '/api/system/:path*'
  ]
}