export const siteConfig = {
  name: "Exchange",
  verification: {
    resendCooldown: 120, // in seconds (2 minutes)
    tokenExpiry: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  }
} as const