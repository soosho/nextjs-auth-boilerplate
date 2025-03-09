import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Profile } from "@/components/(protected)/profile/profile"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/login")
  }
  
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      lastLoginIp: true,
      registrationIp: true,
      avatar: true,
      accounts: true
    }
  })
  
  if (!user) {
    redirect("/login")
  }

  return <Profile user={user} />
}