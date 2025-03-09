import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth" 
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import sharp from "sharp"
import { existsSync } from "fs"

// Define allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
// Maximum file size in bytes (1MB)
const MAX_FILE_SIZE = 1 * 1024 * 1024;

// Define constants
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads', 'avatars')

// Create uploads directory at startup
if (!existsSync(UPLOADS_DIR)) {
  mkdir(UPLOADS_DIR, { recursive: true })
    .catch(err => console.error('Failed to create uploads directory:', err))
}

// Generate a unique 10-digit number
async function generateUniqueNumber(): Promise<string> {
  while (true) {
    // Generate 10 digit number
    const num = Math.floor(Math.random() * 9000000000) + 1000000000
    const numStr = num.toString()
    
    // Check if number exists in database
    const exists = await prisma.user.findFirst({
      where: { avatar: numStr }
    })
    
    if (!exists) return numStr
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG and PNG files are allowed" }, { status: 400 })
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 1MB" }, { status: 400 })
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique number for filename
    const uniqueNumber = await generateUniqueNumber()
    
    // Delete old avatar if exists
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { avatar: true }
    })

    if (currentUser?.avatar) {
      const oldPath = join(UPLOADS_DIR, `${currentUser.avatar}.webp`)
      if (existsSync(oldPath)) {
        await unlink(oldPath)
      }
    }

    try {
      // Process and save image
      const processedImage = await sharp(buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toBuffer()

      const filePath = join(UPLOADS_DIR, `${uniqueNumber}.webp`)
      await writeFile(filePath, processedImage)

      // Update database with new avatar
      await prisma.user.update({
        where: { email: session.user.email },
        data: { avatar: uniqueNumber }
      })

      return NextResponse.json({
        message: "Avatar updated successfully",
        url: uniqueNumber
      })
    } catch (error) {
      console.error("Processing/saving error:", error)
      return NextResponse.json({ error: "Failed to process or save image" }, { status: 500 })
    }
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 })
  }
}