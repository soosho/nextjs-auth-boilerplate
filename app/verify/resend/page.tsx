"use client"

import { FormEvent, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import { Geetest, GeetestValidateResult } from "@/components/geetest"
import { CountdownTimer } from "@/components/countdown-timer"
import { siteConfig } from "@/config/site"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ResendVerificationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true) // Add isChecking state
  const [email, setEmail] = useState("")
  const [captchaData, setCaptchaData] = useState<GeetestValidateResult | null>(null)
  const [canResend, setCanResend] = useState(false)
  const [nextResendTime, setNextResendTime] = useState<number | null>(null)

  // Check cookie on page load
  useEffect(() => {
    async function checkLimit() {
      try {
        const response = await fetch('/api/check-resend-limit', {
          method: 'POST'
        })
        
        const data = await response.json()
        setCanResend(data.canResend)
        setNextResendTime(data.nextResendTime || null)
      } catch (error) {
        console.error('Failed to check limit:', error)
        setCanResend(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkLimit()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    if (!captchaData) {
      toast.error("Please complete the verification")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          captcha: captchaData
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Verification email sent", {
          description: "Please check your inbox"
        })
        
        // Immediately update UI state
        setCanResend(false)
        setNextResendTime(Date.now() + (siteConfig.verification.resendCooldown * 1000)) // 2 minutes
        setCaptchaData(null)
      } else {
        toast.error(data.error || "Failed to send verification email")
      }
    } catch {
      toast.error("An error occurred while sending the verification email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Resend Verification</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a new verification link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isChecking ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || !canResend}
                />
              </div>

              {!canResend && nextResendTime ? (
                <div className="text-center text-sm text-muted-foreground">
                  Please wait <CountdownTimer 
                    targetTime={nextResendTime}
                    onComplete={() => {
                      setCanResend(true)
                      setNextResendTime(null)
                    }}
                  /> before requesting another email
                </div>
              ) : (
                <div className="space-y-2">
                  {captchaData ? (
                    <div className="flex items-center justify-center text-green-500 gap-2 rounded-md border border-green-200 bg-green-50 py-3">
                      <CheckCircle className="h-5 w-5" />
                      <span>Verification complete</span>
                    </div>
                  ) : (
                    <Geetest
                      onSuccess={(data) => {
                        setCaptchaData(data)
                        toast.success("Verification successful")
                      }}
                      onError={() => {
                        toast.error("Verification failed")
                        setCaptchaData(null)
                      }}
                    />
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !captchaData || !canResend}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send verification email"
                )}
              </Button>
            </form>
          )}

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Back to login
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}