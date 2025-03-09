import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

const checkSchema = z.object({
  email: z.string().email(),
  loginType: z.enum(["google", "credentials"]).default("credentials"), // Add loginType
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = checkSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, loginType } = result.data; // Extract loginType
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    console.log("IP Check - x-forwarded-for:", ip); // Add this line

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
      console.log("IP Check - User not found"); // Add this line
      return NextResponse.json({ requiresOTP: false })
    }

    console.log("IP Check - lastLoginIp from DB:", user.lastLoginIp); // Add this line

    // If user has Google account linked AND is logging in with Google, OTP not required
    if (user.accounts.length > 0 && loginType === "google") {
      console.log("IP Check - Google account linked AND Google login, OTP not required"); // Add this line
      return NextResponse.json({ requiresOTP: false })
    }

    // For email login, check IP
    const requiresOTP = !user.lastLoginIp || user.lastLoginIp !== ip

    console.log("IP Check - requiresOTP:", requiresOTP); // Add this line

    return NextResponse.json({ requiresOTP })
  } catch (error) {
    console.error("IP check error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}