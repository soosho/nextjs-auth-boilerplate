import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/auth"

const checkSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = checkSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email } = result.data;
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    console.log("IP Check - x-forwarded-for:", ip);

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        lastLoginIp: true,
        accounts: {
          where: { provider: "google" }
        }
      }
    })

    if (!user) {
      console.log("IP Check - User not found");
      return NextResponse.json({ requiresOTP: false })
    }

    console.log("IP Check - lastLoginIp from DB:", user.lastLoginIp);

    const session = await auth();

    // Determine loginType based on linked accounts
    let loginType = "credentials";
    if (session?.user.loginType === "google") {
      loginType = "google";
    }

    // If user has Google account linked AND is logging in with Google, OTP not required
    if (user.accounts.length > 0 && loginType === "google") {
      console.log("IP Check - Google account linked AND Google login, OTP not required");
      return NextResponse.json({ requiresOTP: false })
    }

    // For email login, check IP
    const requiresOTP = !user.lastLoginIp || user.lastLoginIp !== ip

    console.log("IP Check - requiresOTP:", requiresOTP);

    return NextResponse.json({ requiresOTP })
  } catch (error) {
    console.error("IP check error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}