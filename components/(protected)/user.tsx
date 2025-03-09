import { prisma } from "@/lib/prisma"

export async function getUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
    }
  })

  return user
}