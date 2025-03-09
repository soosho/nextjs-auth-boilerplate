"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-800/20 bg-[#0d1117]/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20">
      <div className="container mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Exchange
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-white/5"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              asChild
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}