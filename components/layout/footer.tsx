import Link from "next/link"
import { siteConfig } from "@/config/site"

export function Footer() {
  return (
    <footer className="border-t border-gray-800/20 bg-[#0d1117]/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20">
      <div className="container mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-col md:flex-row py-6 md:h-16 items-center justify-between gap-4 md:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-sm text-gray-400">
              Built with{" "}
              <a 
                href="https://nextjs.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-purple-400 hover:text-purple-300"
              >
                Next.js
              </a>
              {" "}and{" "}
              <a 
                href="https://ui.shadcn.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Shadcn UI
              </a>
            </p>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Exchange. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}