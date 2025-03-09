import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PersonalForm } from "@/components/(protected)/profile/update/personal-form"

export default async function UpdatePersonalPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      avatar: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  return <PersonalForm initialData={user} />
}