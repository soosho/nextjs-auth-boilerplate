import Link from "next/link"
import { siteConfig } from "@/config/site"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Contact
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}