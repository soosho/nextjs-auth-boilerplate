import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { randomBytes } from "crypto"
import { siteConfig } from "@/config/site"
import { rateLimit, clearRateLimit } from '@/lib/rate-limit'; // Assuming you create a rate-limit.ts file in your lib directory

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
    const identifier = ip ?? '127.0.0.1';

    const { success } = await rateLimit(identifier, email); // Use combined IP and email

    if (!success) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date()

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

    if (!otp) {
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

      return NextResponse.json({ 
        error: "Invalid or expired code",
        debug: { email, code, type }
      }, { status: 400 })
    }

    await prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true }
    })

    if (type === "password_reset") {
      const resetToken = randomBytes(32).toString("hex")
      const tokenExpiry = new Date(Date.now() + siteConfig.verification.tokenExpiry)

      await prisma.user.update({
        where: { email },
        data: {
          verifyToken: resetToken,
          verifyTokenExpiry: tokenExpiry
        }
      })

      clearRateLimit(identifier, email); // Clear rate limit after successful password reset

      return NextResponse.json({ 
        success: true, 
        resetToken 
      })
    }

    if (type === "login") {
      await prisma.user.update({
        where: { email },
        data: { lastLoginIp: ip }
      })

      clearRateLimit(identifier, email); // Clear rate limit after successful login
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