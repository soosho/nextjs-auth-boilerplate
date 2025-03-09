import Link from "next/link"
import { 
  Github, 
  Twitter, 
  MessageCircle, 
  Send
} from "lucide-react"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Function to get icon by platform name
function getSocialIcon(platform: string) {
  switch (platform) {
    case 'twitter': return <Twitter className="h-4 w-4" />
    case 'github': return <Github className="h-4 w-4" />
    case 'discord': return <MessageCircle className="h-4 w-4" />
    case 'telegram': return <Send className="h-4 w-4" />
    default: return null
  }
}

// Function to format platform name for display
function formatPlatformName(platform: string): string {
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="w-full border-t py-4 md:py-0">
      <div className="flex flex-col items-center justify-between gap-4 px-4 md:px-6 md:h-16 md:flex-row">
        <p className="text-xs text-muted-foreground md:text-sm">
          &copy; {currentYear} {siteConfig.name}. All rights reserved.
        </p>
        
        <div className="flex items-center gap-4">
          {/* Legal links */}
          <nav className="flex gap-4 text-xs text-muted-foreground md:gap-6 md:text-sm">
            <Link href={siteConfig.legal.terms} className="hover:underline">
              Terms
            </Link>
            <Link href={siteConfig.legal.privacy} className="hover:underline">
              Privacy
            </Link>
            <Link href="/help" className="hover:underline">
              Help
            </Link>
          </nav>
          
          {/* Social media links with tooltips */}
          <TooltipProvider>
            <div className="flex items-center gap-3">
              {Object.entries(siteConfig.social).map(([platform, url]) => {
                const icon = getSocialIcon(platform);
                const displayName = formatPlatformName(platform);
                
                // Only render links that have icons
                return icon ? (
                  <Tooltip key={platform} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-muted-foreground hover:text-foreground transition-colors",
                          "h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted"
                        )}
                        aria-label={`Visit our ${platform} page`}
                      >
                        {icon}
                        <span className="sr-only">{platform}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {displayName}
                    </TooltipContent>
                  </Tooltip>
                ) : null;
              })}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </footer>
  )
}