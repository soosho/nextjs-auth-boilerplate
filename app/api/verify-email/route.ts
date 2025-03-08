import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({
        error: "Verification token is required"
      }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        error: "Invalid or expired verification token"
      }, { status: 400 })
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null
      }
    })

    return NextResponse.json({ 
      isVerified: true,
      message: "Email verified successfully" 
    })

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({
      error: "Failed to verify email"
    }, { status: 500 })
  }
}