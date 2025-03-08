"use client"

import { FormEvent, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pageEmail, setPageEmail] = useState("")
  const [pageToken, setPageToken] = useState("")
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    // Immediate validation of URL parameters
    if (!email?.trim() || !token?.trim() || token.length < 32) {
      router.replace('/forgot-password')
      return
    }

    // Set the values from URL parameters
    setPageEmail(email)
    setPageToken(token)

  }, [router, searchParams])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const token = formData.get('token') as string

    if (!email || !token || token.length < 32) {
      toast.error("Invalid reset request")
      router.replace('/forgot-password')
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          password
        })
      })

      if (response.ok) {
        toast.success("Password reset successful", {
          description: "You can now login with your new password"
        })
        router.push('/login')
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to reset password")
        if (data.error === "Invalid token") {
          router.replace('/forgot-password')
        }
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast.error("An error occurred", {
        description: "Please try again later"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If no email/token, show nothing (will redirect)
  if (!pageEmail || !pageToken) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden inputs for email and token */}
            <input type="hidden" name="email" value={pageEmail} />
            <input type="hidden" name="token" value={pageToken} />

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}