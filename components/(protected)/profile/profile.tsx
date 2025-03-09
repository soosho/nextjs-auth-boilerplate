"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  Github,
  Globe,
  Mail,
  Network,
  Pencil,
  ShieldCheck,
  UserCheck,
  XCircle,
  User,
  Loader2,
  User2
} from "lucide-react"
import { formatDistance } from "date-fns"
import { useState } from "react"

interface ProfileProps {
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
    emailVerified: boolean | null  // Changed from Date | null to boolean | null
    createdAt: Date
    lastLoginIp: string | null
    registrationIp: string | null
    avatar: string | null
    accounts: {
      id: string
      provider: string
      type: string
      providerAccountId: string
    }[]
  }
}

function ProviderIcon({ provider }: { provider: string }) {
  const providerLower = provider.toLowerCase();
  
  if (providerLower === 'google') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
        <path 
          fill="#4285F4" 
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path 
          fill="#34A853" 
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path 
          fill="#FBBC05" 
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path 
          fill="#EA4335" 
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  } else if (providerLower === 'github') {
    return <Github className="h-4 w-4" />;
  } else if (providerLower === 'microsoft') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4">
        <path fill="#f1511b" d="M11.4 24H0V12.6h11.4V24z" />
        <path fill="#80cc28" d="M24 24H12.6V12.6H24V24z" />
        <path fill="#00adef" d="M11.4 11.4H0V0h11.4v11.4z" />
        <path fill="#fbbc09" d="M24 11.4H12.6V0H24v11.4z" />
      </svg>
    );
  } else if (providerLower === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4">
        <path
          fill="currentColor"
          d="M9.677 20.895v-7.745H7.687v-2.824h1.99V7.89c0-1.97 1.204-3.04 2.957-3.04 1.599 0 1.788.123 2.033.182V7.1l-1.355.001c-1.058 0-1.26.501-1.26 1.245v1.98h2.518l-.328 2.824h-2.19v7.745H9.677z"
        />
      </svg>
    );
  } else if (providerLower === 'apple') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4">
        <path
          fill="currentColor"
          d="M16.742 1.38c-1.052.022-2.215.705-2.923 1.57-.639.775-1.18 1.91-1.03 3.03 1.143.088 2.307-.59 2.994-1.474.65-.817 1.142-1.956 1.03-3.035c-.92-.011-.249-.038-.07-.09zm-1.847 4.479c-.761.013-1.695.433-2.247.925l-.687.52c-.391.258-.883.433-1.5.433-1.152 0-2.185-.75-2.883-1.878 0 0-.286-.583-.933-.583-1.476 0-3.466 2.913-3.466 5.558 0 0 1.215 5.433 2.593 7.853.183.322 2.01 3.12 3.438 3.12.646 0 1.52-.85 2.2-.85.51 0 1.27.868 2.08.868 1.12 0 3.06-2.73 3.06-2.73.532-.9.96-1.95 1.27-2.91.193-.61.077-.915-.439-1.154a3.123 3.123 0 0 1-1.613-2.733c0-1.006.48-1.79 1.347-2.342.37-.24.476-.51.337-.92-.287-.843-2.202-2.158-2.557-2.178z"
        />
      </svg>
    );
  } else if (providerLower === 'twitter') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4">
        <path
          fill="currentColor"
          d="M8.08 20c8.498 0 13.148-7.037 13.148-13.146 0-.199-.004-.398-.013-.596.902-.652 1.687-1.47 2.306-2.398-.828.368-1.72.616-2.657.728.955-.57 1.687-1.476 2.033-2.555-.893.53-1.882.912-2.932 1.12-1.843-1.959-4.92-2.058-6.894-.223-1.268 1.185-1.811 2.95-1.415 4.621-3.933-.197-7.415-2.076-9.741-5.147-1.243 2.138-.611 4.876 1.453 6.253-.766-.024-1.513-.235-2.17-.615v.063c0 2.225 1.57 4.131 3.767 4.568-.708.194-1.453.238-2.18.13.61 1.91 2.38 3.22 4.408 3.261-1.67 1.312-3.771 2.037-5.952 2.035-.387 0-.773-.023-1.154-.069 2.161 1.383 4.716 2.145 7.369 2.143"
        />
      </svg>
    );
  } else {
    return <ExternalLink className="h-4 w-4" />;
  }
}

function getProviderColor(provider: string): string {
  const providerLower = provider.toLowerCase();
  
  switch (providerLower) {
    case 'google':
      return 'bg-white border border-gray-200';
    case 'github':
      return 'bg-black text-white';
    case 'microsoft':
      return 'bg-white';
    case 'facebook':
      return 'bg-[#1877F2] text-white';
    case 'apple':
      return 'bg-black text-white';
    case 'twitter':
      return 'bg-[#1DA1F2] text-white';
    default:
      return 'bg-primary/10 text-primary';
  }
}

export function Profile({ user }: ProfileProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
  
  const memberSince = formatDistance(
    new Date(user.createdAt),
    new Date(),
    { addSuffix: true }
  )

  // Format the date as DD/MM/YYYY
  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-8">
      <div className="w-full max-w-5xl">
        <div className="relative mb-8">
          {/* Decorative background */}
          <div className="absolute inset-0 h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg -z-10" />
          
          {/* Header content - equal padding top and bottom */}
          <div className="relative px-6 py-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar section */}
              <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                {user.avatar ? (
                  <>
                    <AvatarImage
                      src={`/uploads/avatars/${user.avatar}.webp`}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    {isImageLoading && (
                      <AvatarFallback>
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </AvatarFallback>
                    )}
                  </>
                ) : (
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                )}
              </Avatar>
              
              {/* User info section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                  <Badge 
                    variant={user.emailVerified ? "secondary" : "destructive"}
                    className={`flex items-center gap-1 ${
                      user.emailVerified 
                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/30" 
                        : ""
                    }`}
                  >
                    {user.emailVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Verified Email
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Unverified Email
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center mt-2"> {/* Changed mt-1 to mt-2 */}
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of profile content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and security settings
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Member Since</div>
                      <div className="text-sm text-muted-foreground">{memberSince}</div>
                      <div className="text-xs text-muted-foreground">
                        {formattedDate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Personal Information</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        Profile Details: 
                        <Link 
                          href="/profile/update/personal" 
                          className="ml-1 text-primary hover:underline inline-flex items-center gap-1 group"
                        >
                          Update
                          <Pencil className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Account Security</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        Password: 
                        <Link 
                          href="/profile/update/password" 
                          className="ml-1 text-primary hover:underline inline-flex items-center gap-1 group"
                        >
                          Change
                          <Pencil className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Connected Accounts: <Badge variant="outline" className="ml-1">{user.accounts.length}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Network className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Last Login</div>
                      <div className="text-sm text-muted-foreground">IP: {user.lastLoginIp || "N/A"}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Registration</div>
                      <div className="text-sm text-muted-foreground">IP: {user.registrationIp || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Connected Accounts
              </CardTitle>
              <CardDescription>
                External accounts linked to your profile
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {user.accounts.length > 0 ? (
                <div className="space-y-4">
                  {user.accounts.map(account => (
                    <div key={account.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className={`p-1.5 rounded-full ${getProviderColor(account.provider)}`}>
                        <ProviderIcon provider={account.provider} />
                      </div>
                      <div>
                        <div className="font-medium capitalize">
                          {account.provider}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {account.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {account.providerAccountId.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-6">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No connected accounts</p>
                  <p className="text-xs mt-1">Link accounts for easier sign in</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}