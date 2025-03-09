import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Input validation schema
const emailSchema = z.object({
  email: z.string().email("Invalid email format")
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = emailSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({
        error: "Invalid email format",
        details: result.error.issues
      }, { 
        status: 400 
      })
    }

    const { email } = result.data

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        emailVerified: true,
        verifyToken: true,
        verifyTokenExpiry: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if verification is expired
    const isExpired = user.verifyTokenExpiry ? 
      user.verifyTokenExpiry < new Date() : 
      false

    return NextResponse.json({
      isVerified: user.emailVerified === true && !isExpired,
      hasActiveToken: user.verifyToken && user.verifyTokenExpiry && 
                     new Date(user.verifyTokenExpiry) > new Date(),
      status: user.emailVerified ? 'verified' : 'pending'
    })

  } catch (error) {
    console.error("Verification check error:", error)
    return NextResponse.json({
      error: "Failed to check verification status",
      status: 'error'
    }, { 
      status: 500 
    })
  }
}