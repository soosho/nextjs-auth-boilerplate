import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { sendOTPEmail } from "@/lib/email"

const sendSchema = z.object({
  email: z.string().email(),
  type: z.enum(["login", "password_reset", "withdraw"])
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = sendSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, type } = result.data
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Create OTP record
    await prisma.oTP.create({
      data: {
        type,
        code,
        email,
        ip,
        expiresAt
      }
    })

    // Send email
    await sendOTPEmail(email, code, type)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ 
      error: "Failed to send OTP",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}