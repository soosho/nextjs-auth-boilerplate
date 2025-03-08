import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

const checkSchema = z.object({
  email: z.string().email()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = checkSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    
    const user = await prisma.user.findUnique({
      where: { email: result.data.email },
      select: {
        lastLoginIp: true
      }
    })

    if (!user) {
      return NextResponse.json({ requiresOTP: false })
    }

    const requiresOTP = !user.lastLoginIp || user.lastLoginIp !== ip

    return NextResponse.json({ requiresOTP })
  } catch (error) {
    console.error("IP check error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}