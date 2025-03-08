import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createHmac, randomBytes } from 'crypto'
import { sendVerificationEmail } from "@/lib/email"
import { headers } from 'next/headers'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

async function verifyGeetest(captcha: {
  lot_number: string
  captcha_output: string
  pass_token: string
  gen_time: string
}) {
  try {
    // Generate signature using HMAC-SHA256
    const sign_token = createHmac('sha256', process.env.GEETEST_KEY!)
      .update(captcha.lot_number)
      .digest('hex')

    // Prepare verification data
    const verifyData = new URLSearchParams({
      lot_number: captcha.lot_number,
      captcha_output: captcha.captcha_output,
      pass_token: captcha.pass_token,
      gen_time: captcha.gen_time,
      sign_token: sign_token,
      captcha_id: process.env.NEXT_PUBLIC_GEETEST_ID!
    })

    // Make verification request
    const verifyUrl = `https://gcaptcha4.geetest.com/validate?${verifyData.toString()}`
    const response = await fetch(verifyUrl, {
      method: 'POST', // Changed from GET to POST
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
    const body = await request.json()
    
    // Verify captcha first
    if (!body.captcha || !await verifyGeetest(body.captcha)) {
      return NextResponse.json({
        error: "Captcha verification failed"
      }, { status: 400 })
    }
    
    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({
        error: "Invalid input",
        details: result.error.issues
      }, { 
        status: 400 
      })
    }

    const { firstName, lastName, email, password } = result.data

    // Get IP address
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Generate verification token
    const verifyToken = randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        verifyToken,
        verifyTokenExpiry,
        registrationIp: ip
      },
    })

    // Send verification email
    await sendVerificationEmail(email, verifyToken)

    return NextResponse.json({
      success: true,
      message: "Verification email sent"
    })
  } catch (error: unknown) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}