import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span>Welcome, {session.user?.name}</span>
              <form action={async () => {
                'use server'
                await signOut()
              }}>
                <Button variant="destructive" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to your Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You are now signed in to your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}