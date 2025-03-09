export const siteConfig = {
  name: "Exchange",
  verification: {
    resendCooldown: 120,
    tokenExpiry: 3600 * 24, // 24 hours
  },
  logo: "https://cdn.brandfetch.io/id2alue-rx/w/800/h/162/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B",
  support: "support@yourdomain.com",
  address: "123 Main Street, City, Country",
  
  // Social media links
  social: {
    twitter: "https://twitter.com/yourcompany",
    github: "https://github.com/yourcompany",
    discord: "https://discord.gg/yourcompany",
    youtube: "https://youtube.com/c/yourcompany",
    telegram: "https://t.me/yourcompany"
  },
  
  // Main website details
  website: "https://yourcompany.com",
  description: "Your company description goes here. This can be used for meta tags and other SEO purposes.",
  
  // Legal documents
  legal: {
    terms: "/terms",
    privacy: "/privacy",
    cookies: "/cookies"
  }
} as const

// Type for social platforms (useful for TypeScript)
export type SocialPlatform = keyof typeof siteConfig.social