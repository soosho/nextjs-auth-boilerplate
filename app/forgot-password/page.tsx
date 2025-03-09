"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import { Geetest, GeetestValidateResult } from "@/components/geetest"
import { OTPVerificationModal } from "@/components/otp-verification-modal"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [captchaData, setCaptchaData] = useState<GeetestValidateResult | null>(null)
  const [showOTP, setShowOTP] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)

    try {
      // Only validate captcha and show modal
      const captchaResponse = await fetch('/api/system/validate-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captcha: captchaData })
      })

      if (!captchaResponse.ok) {
        toast.error("Captcha verification failed")
        return
      }

      // Show OTP modal - don't send OTP yet
      setShowOTP(true)
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error("An error occurred", {
        description: "Please try again later"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerify = async (code: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          type: 'password_reset'
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Verification successful")
        router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${data.resetToken}`)
        return true
      }
      
      toast.error("Invalid verification code")
      return false
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error("Failed to verify code")
      return false
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              {captchaData ? (
                <div className="flex items-center justify-center text-green-500 gap-2 rounded-md border border-green-200 bg-green-50 py-3">
                  <CheckCircle className="h-5 w-4" />
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

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !captchaData || !email}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link 
              href="/login" 
              className="text-primary hover:underline"
            >
              Remember your password? Login
            </Link>
          </div>
        </CardContent>
      </Card>

      <OTPVerificationModal
        email={email}
        isOpen={showOTP}
        type="password_reset"
        onVerify={handleOTPVerify}
        onClose={() => {
          setShowOTP(false)
          setIsLoading(false)
        }}
      />
    </div>
  )
}