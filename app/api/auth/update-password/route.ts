import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { hash, compare } from 'bcryptjs'
import { z } from "zod"

// Create schema for validation with enhanced password requirements
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least 1 symbol"),
  confirmPassword: z.string(),
  resetToken: z.string(), // This ensures OTP was verified
  captcha: z.object({
    lot_number: z.string(),
    captcha_output: z.string(),
    pass_token: z.string(),
    gen_time: z.string()
  })
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function POST(request: Request) {
  try {
    // Get session to ensure user is authenticated
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const result = updatePasswordSchema.safeParse(body)
    if (!result.success) {
      // Extract formatted error messages for more helpful responses
      const formattedErrors = result.error.format();
      
      // Check if the error is specifically about password requirements
      const passwordErrors = formattedErrors.newPassword?._errors || [];
      
      if (passwordErrors.length > 0) {
        return NextResponse.json({
          error: "Password requirements not met",
          details: passwordErrors.join(", ")
        }, { status: 400 })
      }
      
      return NextResponse.json({
        error: "Validation failed",
        details: formattedErrors
      }, { status: 400 })
    }
    
    const { currentPassword, newPassword, resetToken } = result.data
    
    // Verify the reset token
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
        verifyToken: resetToken,
        verifyTokenExpiry: { gt: new Date() }
      }
    })
    
    if (!user) {
      return NextResponse.json({
        error: "Invalid or expired token"
      }, { status: 400 })
    }
    
    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password || '')
    if (!isPasswordValid) {
      return NextResponse.json({
        error: "Current password is incorrect"
      }, { status: 400 })
    }
    
    // Hash new password
    const hashedPassword = await hash(newPassword, 10)
    
    // Update user with new password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verifyToken: null,
        verifyTokenExpiry: null
      }
    })
    
    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    })
  } catch (error) {
    console.error("Update password error:", error)
    return NextResponse.json({
      error: "Failed to update password",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}