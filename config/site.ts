export const siteConfig = {
  name: "Exchange",
  verification: {
    resendCooldown: 120,
    tokenExpiry: 3600 * 24, // or whatever value you have
  },
  logo: "https://cdn.brandfetch.io/id2alue-rx/w/800/h/162/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B",
  support: "support@yourdomain.com",
  address: "123 Main Street, City, Country"
} as const