import { auth } from "@/auth"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  BarChart3, 
  Calendar, 
  Clock, 
  CreditCard, 
  Settings, 
  Shield, 
  User 
} from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function OverviewPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return null;
  }
  
  // Get full user data from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { accounts: true }
  })
  
  if (!user) {
    return null;
  }

  const userName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email
    
  // Format user creation date
  const joinedDate = new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", 
    day: "numeric"
  })

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.firstName || userName}</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your account activity and information.
        </p>
      </div>

      {/* Stats Cards - Only keeping these 4 cards as requested */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Member Since
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{joinedDate}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Login Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Last login: Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Accounts
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {user.accounts.length > 0 
                ? user.accounts.map(a => a.provider).join(", ") 
                : "None"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Status
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              {user.emailVerified ? "Email verified" : "Email not verified"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}