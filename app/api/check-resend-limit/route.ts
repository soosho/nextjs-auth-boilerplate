import { NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { siteConfig } from "@/config/site"

const COOKIE_NAME = 'last_verification_request'
const COOLDOWN = siteConfig.verification.resendCooldown // Get from config

export async function POST() {
  try {
    const cookieStore = await cookies()
    const lastRequest = cookieStore.get(COOKIE_NAME)

    if (lastRequest) {
      const lastRequestTime = parseInt(lastRequest.value)
      const now = Date.now()
      const timeElapsed = now - lastRequestTime

      if (timeElapsed < COOLDOWN * 1000) {  // Convert seconds to milliseconds
        return NextResponse.json({
          canResend: false,
          nextResendTime: lastRequestTime + (COOLDOWN * 1000)  // Convert to milliseconds
        })
      }
    }

    return NextResponse.json({ canResend: true })

  } catch (error) {
    console.error('Check resend limit error:', error)
    return NextResponse.json({ 
      error: "Failed to check resend limit"
    }, { status: 500 })
  }
}