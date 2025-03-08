"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useParams } from "next/navigation"

interface Status {
  success: boolean
  title: string
  message: string
}

export default function VerifyPage() {
  const params = useParams()
  const [status, setStatus] = useState<Status | null>(null)
  const token = params?.token as string

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus({
            success: true,
            title: "Email Verified",
            message: "Your email has been successfully verified. You can now log in to your account."
          })
        } else {
          setStatus({
            success: false,
            title: "Verification Failed",
            message: data.error || "This verification link is invalid or has expired."
          })
        }
      } catch {
        setStatus({
          success: false,
          title: "Verification Error",
          message: "An error occurred during verification. Please try again."
        })
      }
    }

    if (token) {
      verifyEmail()
    }
  }, [token])

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            {status.success ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-center">{status.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{status.message}</p>
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
