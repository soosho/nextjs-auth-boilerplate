"use client"

import { FormEvent, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, XCircle, Eye, EyeOff } from "lucide-react" // Added Eye and EyeOff
import { Geetest, GeetestValidateResult } from "@/components/geetest"
import { Separator } from "@/components/ui/separator"
import { signIn } from "next-auth/react"
import { FaGoogle } from "react-icons/fa"
import zxcvbn from 'zxcvbn'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [captchaData, setCaptchaData] = useState<GeetestValidateResult | null>(null)
  
  // Password validation states
  const [password, setPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasSymbol: false,
    hasNumber: false
  })
  
  // Email validation state
  const [email, setEmail] = useState("")
  const [isValidEmail, setIsValidEmail] = useState(true)

  // Check if component is mounted (client-side)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    
    // Calculate password strength
    const result = zxcvbn(newPassword)
    setPasswordStrength(result.score)
    
    // Check each password requirement
    setPasswordRequirements({
      minLength: newPassword.length >= 8,
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword)
    })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    // Only validate if there's actual content
    if (value && !value.endsWith("@gmail.com")) {
      setIsValidEmail(false)
    } else {
      setIsValidEmail(true)
    }
  }

  const handleEmailBlur = () => {
    if (email && !email.endsWith("@gmail.com")) {
      toast.error("Only Gmail addresses are allowed")
      setIsValidEmail(false)
    }
  }

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    // Check email validity
    if (email && !email.endsWith("@gmail.com")) {
      toast.error("Only Gmail addresses are allowed")
      setIsLoading(false)
      return
    }

    // Check password requirements
    if (!passwordRequirements.minLength || !passwordRequirements.hasSymbol || !passwordRequirements.hasNumber) {
      toast.error("Password does not meet requirements", {
        description: "Please ensure your password has at least 8 characters, 1 symbol, and 1 number"
      })
      setIsLoading(false)
      return
    }

    if (!captchaData) {
      toast.error("Verification required", {
        description: "Please complete the captcha verification"
      })
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const submittedEmail = formData.get("email") as string // Renamed from 'email' to 'submittedEmail'
    
    try {
      const response = await fetch('/api/system/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: submittedEmail, // Updated reference
          password: formData.get("password"),
          captcha: captchaData
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setUserEmail(submittedEmail) // Updated reference
      } else {
        const data = await response.json()
        if (data.details) {
          toast.error("Validation Error", {
            description: data.details.map((error: { message: string }) => error.message).join(", ")
          })
        } else {
          toast.error("Registration Failed", {
            description: data.error
          })
        }
      }
    } catch {
      toast.error("Registration failed", {
        description: "An error occurred during registration"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-50 p-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We&apos;ve sent you a verification link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/50 p-6">
              <p className="text-center mb-2 text-sm text-muted-foreground">
                We&apos;ve sent a verification email to:
              </p>
              <p className="text-center font-medium break-all">
                {userEmail}
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Click the link in the email to verify your account. If you don&apos;t see the email, check your spam folder.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/verify/resend')}
            >
              Didn&apos;t receive the email?
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Back to login
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="John"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@gmail.com"
                disabled={isLoading}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                value={email}
                className={!isValidEmail ? "border-red-500" : ""}
              />
              {!isValidEmail && (
                <p className="text-red-500 text-xs mt-1">Only Gmail addresses are allowed</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  onChange={handlePasswordChange}
                  value={password}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  autoComplete="new-password"
                  className="pr-10" // Add padding for the eye icon
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
                
                {mounted && isPasswordFocused && (
                  <div className="absolute left-full ml-3 top-0 bg-white dark:bg-gray-800 p-3 rounded-md border shadow-md w-72 z-10">
                    <h4 className="text-sm font-medium mb-2">Password requirements:</h4>
                    <ul className="space-y-1">
                      <li className="flex items-center space-x-2">
                        {passwordRequirements.minLength ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> :
                          <XCircle className="h-4 w-4 text-red-500" />}
                        <span className={`text-xs ${passwordRequirements.minLength ? "text-green-600" : "text-red-500"}`}>
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        {passwordRequirements.hasSymbol ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> :
                          <XCircle className="h-4 w-4 text-red-500" />}
                        <span className={`text-xs ${passwordRequirements.hasSymbol ? "text-green-600" : "text-red-500"}`}>
                          At least 1 symbol (!@#$%^&*...)
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        {passwordRequirements.hasNumber ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> :
                          <XCircle className="h-4 w-4 text-red-500" />}
                        <span className={`text-xs ${passwordRequirements.hasNumber ? "text-green-600" : "text-red-500"}`}>
                          At least 1 number
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${passwordStrength * 25}%`,
                    backgroundColor: passwordStrength < 2 ? '#ef4444' : 
                                    passwordStrength < 4 ? '#f59e0b' : '#22c55e' 
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {captchaData ? (
                <div className="flex items-center justify-center text-green-500 gap-2 rounded-md border border-green-200 bg-green-50 py-3">
                  <CheckCircle className="h-5 w-5" />
                  <span>Captcha verified</span>
                </div>
              ) : (
                <Geetest
                  onSuccess={(data: GeetestValidateResult) => {
                    setCaptchaData(data)
                    toast.success("Verification successful", {
                      description: "You can now create your account"
                    })
                  }}
                  onError={() => {
                    toast.error("Verification failed", {
                      description: "Please try again"
                    })
                    setCaptchaData(null)
                  }}
                />
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !captchaData || !isValidEmail || 
                       !(passwordRequirements.minLength && 
                         passwordRequirements.hasSymbol && 
                         passwordRequirements.hasNumber)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mb-6"
            disabled={isLoading}
            onClick={() => signIn("google", { callbackUrl: "/overview" })}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-6"
            onClick={() => router.push('/login')}
          >
            Sign in
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}