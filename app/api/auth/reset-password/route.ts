import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"

const resetSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  token: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = resetSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, password, token } = result.data
    
    // Verify token matches the email
    const user = await prisma.user.findFirst({
      where: { 
        AND: [
          { email: email },
          { verifyToken: token },
          { verifyTokenExpiry: { gt: new Date() } }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: "Invalid or expired reset token" 
      }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12)

    // Update password and clear token
    await prisma.user.update({
      where: { id: user.id }, // Use ID for safety
      data: { 
        password: hashedPassword,
        verifyToken: null,
        verifyTokenExpiry: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ 
      error: "Failed to reset password"
    }, { status: 500 })
  }
}