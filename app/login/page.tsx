"use client"

import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, Eye, EyeOff } from "lucide-react" // Added Eye and EyeOff
import { Geetest, GeetestValidateResult } from "@/components/geetest"
import { OTPVerificationModal } from "@/components/otp-verification-modal"
import { FaGoogle } from "react-icons/fa"

interface FormState {
  email: string
  password: string
  error?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: ""
  })
  const [captchaData, setCaptchaData] = useState<GeetestValidateResult | null>(null)
  const [showOTP, setShowOTP] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // Add password visibility toggle state

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setFormState(prev => ({ ...prev, error: undefined }))

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      // Basic validation
      if (!email || !password) {
        toast.error("Please fill in all fields")
        setIsLoading(false)
        return
      }

      // Check if email is verified first
      const verifyCheck = await fetch('/api/system/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const { isVerified, error } = await verifyCheck.json()

      if (error) {
        toast.error("Authentication error", {
          description: error
        })
        setIsLoading(false)
        return
      }

      if (!isVerified) {
        toast.error("Email not verified", {
          description: "Please check your email and click the verification link to activate your account."
        })
        setIsLoading(false)
        return
      }

      // Determine loginType based on password presence
      const loginType = password ? "credentials" : "google"; // Or some other default

      // Check IP and OTP requirements
      const checkIpResponse = await fetch("/api/auth/check-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formState.email,
          loginType: loginType // Pass loginType dynamically
        })
      })

      const { requiresOTP } = await checkIpResponse.json()

      if (requiresOTP) {
        // Save credentials and show OTP modal
        setFormState({ email, password })
        setShowOTP(true)
        setIsLoading(false)
        return
      }

      // No OTP required, proceed with normal login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        // Handle different error cases
        switch (result.error) {
          case "CredentialsSignin":
            toast.error("Invalid credentials", {
              description: "The email or password you entered is incorrect"
            })
            break
          case "EmailNotVerified":
            toast.error("Email not verified", {
              description: "Please verify your email before logging in"
            })
            break
          default:
            toast.error("Login failed", {
              description: result.error
            })
        }
        setIsLoading(false)
        return
      }

      toast.success("Login successful", {
        description: "Redirecting to dashboard..."
      })
      router.replace("/overview")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred", {
        description: "Please try again later"
      })
      setIsLoading(false)
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
          email: formState.email,
          code,
          type: 'login'
        })
      })

      if (response.ok) {
        // Proceed with login after OTP verification
        const result = await signIn("credentials", {
          email: formState.email,
          password: formState.password,
          redirect: false,
          callbackUrl: "/overview" // Add this
        })

        if (result?.ok) {
          toast.success("Login successful")
          router.replace("/overview")
          return true
        }
      }
      
      toast.error("Invalid verification code")
      return false
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error("Failed to verify code")
      return false
    }
  }

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value,
      error: undefined
    }))
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className={formState.error ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formState.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={`${formState.error ? "border-red-500" : ""} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    tabIndex={-1} // Prevent tab focus for better accessibility
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="text-sm text-right">
                  <Link 
                    href="/forgot-password" 
                    className="text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
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
                disabled={isLoading || !captchaData || !formState.email || !formState.password}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={() => signIn("google", { callbackUrl: "/overview" })}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <div className="text-center text-sm">
              <Link 
                href="/register" 
                className="text-primary hover:underline"
              >
                Don&apos;t have an account? Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <OTPVerificationModal
        email={formState.email}
        isOpen={showOTP}
        type="login"
        onVerify={handleOTPVerify}
        onClose={() => {
          setShowOTP(false)
          setIsLoading(false)
        }}
      />
    </>
  )
}