import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum(["login", "password_reset", "withdraw"])
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = verifySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, code, type } = result.data
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    // Debug log the input
    console.log("Verifying OTP:", { email, code, type })

    // Find latest valid OTP with debug logging
    const now = new Date()
    console.log("Current time:", now)

    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        type,
        used: false,
        expiresAt: { gt: now }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log("Found OTP:", otp)

    if (!otp) {
      // Check why it failed
      const failedOtp = await prisma.oTP.findFirst({
        where: {
          email,
          code,
          type,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      console.log("Failed OTP check:", {
        foundExpired: failedOtp,
        isUsed: failedOtp?.used,
        isExpired: failedOtp?.expiresAt ? failedOtp.expiresAt < now : null
      })

      return NextResponse.json({ 
        error: "Invalid or expired code",
        debug: { email, code, type }
      }, { status: 400 })
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true }
    })

    // Update user's last login IP if this is a login OTP
    if (type === "login") {
      await prisma.user.update({
        where: { email },
        data: { lastLoginIp: ip }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ 
      error: "Failed to verify OTP",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}