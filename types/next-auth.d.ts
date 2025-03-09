import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      loginType?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}