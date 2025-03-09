import type { Metadata } from "next"
import { ProtectedLayout } from "@/components/(protected)/layout"

export const metadata: Metadata = {
  title: "App Dashboard",
  description: "Manage your account and settings",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}