import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            Welcome to Exchange <ThemeToggle />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
