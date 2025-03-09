"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  HelpCircle,
  Home,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { siteConfig } from "@/config/site"
import Image from "next/image"

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  
  // Navigation items - just overview
  const mainNav = [
    {
      title: "Overview",
      href: "/overview",
      icon: Home,
    }
  ]
  
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-300 ease-in-out md:z-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/overview" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
            <span className="font-semibold text-sm text-primary-foreground">
              {siteConfig.name.charAt(0)}
            </span>
          </div>
          <span className="font-semibold text-lg">{siteConfig.name}</span>
        </Link>
      </div>
      
      {/* Use flex layout to position elements */}
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Scrollable area for nav items */}
        <ScrollArea className="flex-grow">
          <div className="px-3 py-4">
            <div className="mb-6">
              <h2 className="px-4 text-xs font-semibold text-muted-foreground mb-2">
                MAIN
              </h2>
              <nav className="space-y-1">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="mb-6">
              <h2 className="px-4 text-xs font-semibold text-muted-foreground mb-2">
                HELP
              </h2>
              <nav className="space-y-1">
                <Link
                  href="/help"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === "/help"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <HelpCircle className="h-4 w-4" />
                  Help Center
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </nav>
            </div>
          </div>
        </ScrollArea>
        
        {/* Help box always at the bottom */}
        <div className="p-3 border-t">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="text-sm font-medium">Need help?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Check our documentation or contact support for assistance.
            </p>
            <Link
              href="/docs"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              View documentation
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}