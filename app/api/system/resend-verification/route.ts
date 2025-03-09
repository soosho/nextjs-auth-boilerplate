import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from 'zod'
import { createHmac, randomBytes } from 'crypto'
import { sendVerificationEmail } from "@/lib/email"
import { siteConfig } from "@/config/site"

const COOKIE_NAME = 'last_verification_request'
const COOLDOWN = siteConfig.verification.resendCooldown // Get from config

const resendSchema = z.object({
  email: z.string().email("Invalid email format"),
  captcha: z.object({
    lot_number: z.string(),
    captcha_output: z.string(),
    pass_token: z.string(),
    gen_time: z.string()
  })
})

async function verifyGeetest(captcha: {
  lot_number: string
  captcha_output: string
  pass_token: string
  gen_time: string
}) {
  try {
    const sign_token = createHmac('sha256', process.env.GEETEST_KEY!)
      .update(captcha.lot_number)
      .digest('hex')

    const verifyData = new URLSearchParams({
      lot_number: captcha.lot_number,
      captcha_output: captcha.captcha_output,
      pass_token: captcha.pass_token,
      gen_time: captcha.gen_time,
      sign_token: sign_token,
      captcha_id: process.env.NEXT_PUBLIC_GEETEST_ID!
    })

    const verifyUrl = `https://gcaptcha4.geetest.com/validate`
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: verifyData.toString()
    })

    const data = await response.json()
    return data.status === 'success' && data.result === 'success'
  } catch (error) {
    console.error('GeeTest verification error:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { email, captcha } = await request.json()

    // Validate input
    const result = resendSchema.safeParse({ email, captcha })
    if (!result.success) {
      return NextResponse.json({
        error: "Invalid input",
        details: result.error.issues
      }, { status: 400 })
    }

    // Verify captcha
    if (!await verifyGeetest(result.data.captcha)) {
      return NextResponse.json({
        error: "Captcha verification failed"
      }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        error: "Email not found"
      }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({
        error: "Email already verified"
      }, { status: 400 })
    }

    // Generate new verification token and send email
    const verifyToken = randomBytes(32).toString('hex')
    await prisma.user.update({
      where: { email },
      data: {
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })

    await sendVerificationEmail(email, verifyToken)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: "Verification email sent"
    })

    response.cookies.set(COOKIE_NAME, Date.now().toString(), {
      maxAge: COOLDOWN,  // Already in seconds
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return response

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({
      error: "Failed to resend verification email"
    }, { status: 500 })
  }
}