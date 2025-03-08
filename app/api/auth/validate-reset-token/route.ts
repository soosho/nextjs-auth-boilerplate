import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const validateSchema = z.object({
  email: z.string().email(),
  token: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = validateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, token } = result.data
    
    const user = await prisma.user.findFirst({
      where: { 
        AND: [
          { email },
          { verifyToken: token },
          { verifyTokenExpiry: { gt: new Date() } }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}