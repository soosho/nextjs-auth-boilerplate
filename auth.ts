import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"
import { headers } from "next/headers"

export const AuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = credentials as {
            email: string
            password: string
          }

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              emailVerified: true
            }
          })

          if (!user?.emailVerified || !user?.password) {
            return null
          }

          const isValid = await bcrypt.compare(password, user.password)
          if (!isValid) {
            return null
          }

          return user // Return the database user directly
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const headersList = await headers()
          const ip = headersList.get("x-forwarded-for") || "unknown"

          // Use upsert to ensure we get the database user
          const dbUser = await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              lastLoginIp: ip,
              emailVerified: true
            },
            create: {
              email: user.email!,
              firstName: profile?.given_name || "",
              lastName: profile?.family_name || "",
              emailVerified: true,
              password: "",
              registrationIp: ip,
              lastLoginIp: ip
            }
          })

          // Override the user object with database user
          user.id = dbUser.id
          user.firstName = dbUser.firstName
          user.lastName = dbUser.lastName

          // Link Google account if not exists
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: dbUser.id,
              provider: "google"
            }
          })

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: String(account.session_state)
              }
            })
          }
        } catch (error) {
          console.error("Google sign in error:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (trigger === "signIn" && user) {
        // Use the database user ID and data
        token.id = user.id
        token.email = user.email
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Ensure we're using the database user data
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(AuthConfig)