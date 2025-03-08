import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email ?? ""
        session.user.name = token.name
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      }
      return true
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = credentials as {
            email: string
            password: string
          }

          if (!email || !password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              password: true,
              emailVerified: true
            }
          })

          if (!user?.password || !user.emailVerified) {
            return null
          }

          const isValid = await bcrypt.compare(password, user.password)

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim()
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ]
}