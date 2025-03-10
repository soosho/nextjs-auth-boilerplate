"use client"

import { useTheme } from "next-themes"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  Loader2,
} from "lucide-react"
import { siteConfig } from "@/config/site"

interface NavbarProps {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export function Navbar({ toggleSidebar, isSidebarOpen }: NavbarProps) {
  useTheme()
  const [userData, setUserData] = useState<{
    firstName: string | null
    lastName: string | null
    email: string | null
    avatar: string | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/info')
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Get user initials for avatar fallback
  const initials = userData ? `${userData.firstName?.charAt(0) || ''}${
    userData.lastName?.charAt(0) || ''
  }`.toUpperCase() : ''

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <Link href="/overview" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <span className="font-semibold text-sm text-primary-foreground">
                {siteConfig.name.charAt(0)}
              </span>
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {siteConfig.name}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-1 pl-1">
                <Avatar className="h-7 w-7">
                  {isLoading ? (
                    <AvatarFallback>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </AvatarFallback>
                  ) : userData?.avatar ? (
                    <AvatarImage 
                      src={`/uploads/avatars/${userData.avatar}.webp`}
                      alt={`${userData.firstName} ${userData.lastName}`} 
                    />
                  ) : (
                    <AvatarFallback>{initials}</AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                      <div className="h-3 w-32 animate-pulse rounded bg-muted"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        {`${userData?.firstName || ''} ${userData?.lastName || ''}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{userData?.email}</p>
                    </>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}