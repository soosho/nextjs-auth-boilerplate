"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Geetest, GeetestValidateResult } from "@/components/geetest"
import { OTPVerificationModal } from "@/components/otp-verification-modal"
import { Lock, KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import zxcvbn from 'zxcvbn'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [captchaData, setCaptchaData] = useState<GeetestValidateResult | null>(null)
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  
  // Password strength and requirements
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasSymbol: false,
    hasNumber: false
  })
  
  // Check if component is mounted (client-side)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get user session when component mounts
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email)
    } else if (session === null) {
      // Only redirect if session is null (not undefined which means loading)
      toast.error("Not authenticated")
      router.push("/login")
    }
  }, [session, router])

  const handleCaptchaSuccess = (result: GeetestValidateResult) => {
    setCaptchaData(result)
    toast.success("Captcha verified")
  }

  const handleCaptchaError = () => {
    setCaptchaData(null)
    toast.error("Captcha verification failed")
  }
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPasswordValue = e.target.value
    setNewPassword(newPasswordValue)
    
    // Calculate password strength
    const result = zxcvbn(newPasswordValue)
    setPasswordStrength(result.score)
    
    // Check each password requirement
    setPasswordRequirements({
      minLength: newPasswordValue.length >= 8,
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue),
      hasNumber: /[0-9]/.test(newPasswordValue)
    })
  }

  const validateInputs = () => {
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return false
    }
    
    if (!newPassword) {
      toast.error("Please enter a new password")
      return false
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return false
    }
    
    // Check password requirements
    if (!passwordRequirements.minLength || !passwordRequirements.hasSymbol || !passwordRequirements.hasNumber) {
      toast.error("Password does not meet requirements", {
        description: "Please ensure your password has at least 8 characters, 1 symbol, and 1 number"
      })
      return false
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match")
      return false
    }

    if (!captchaData) {
      toast.error("Please complete the captcha verification")
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateInputs()) return
    
    // Open OTP modal
    setOtpModalOpen(true)
  }

  const handleVerifyOTP = async (code: string) => {
    setIsLoading(true)
    
    try {
      // First verify the OTP
      const otpResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          code,
          type: "password_reset"  // Using the password_reset type for password changes too
        })
      })

      if (!otpResponse.ok) {
        const errorData = await otpResponse.json()
        toast.error(errorData.error || "Failed to verify code")
        return false
      }
      
      const otpData = await otpResponse.json()
      
      if (!otpData.resetToken) {
        toast.error("Invalid verification response")
        return false
      }

      // Then update the password
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
          resetToken: otpData.resetToken, // Use the resetToken from OTP verification
          captcha: captchaData
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success("Password updated successfully")
        
        // Reset form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setCaptchaData(null)
        setOtpModalOpen(false) // Close the modal
        
        // Redirect to profile page after a short delay
        setTimeout(() => router.push('/profile'), 1500)
        return true
      } else {
        toast.error(data.error || "Failed to update password")
        return false
      }
    } catch (error) {
      console.error("Update password error:", error)
      toast.error("Something went wrong")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-8">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/profile" className="text-sm flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Update Password</CardTitle>
            <CardDescription className="text-center">
              Change your account password
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Min. 8 characters"
                    disabled={isLoading}
                    className="pr-10"
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
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
                {/* Password strength indicator */}
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
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                {!captchaData && (
                  <div className="pt-2">
                    <Geetest onSuccess={handleCaptchaSuccess} onError={handleCaptchaError} />
                  </div>
                )}
                
                {captchaData && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-center justify-center">
                    <KeyRound className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Captcha verification successful
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={
                  isLoading || 
                  !captchaData || 
                  !(passwordRequirements.minLength && 
                    passwordRequirements.hasSymbol && 
                    passwordRequirements.hasNumber)
                }
              >
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      {/* OTP Verification Modal */}
      <OTPVerificationModal
        email={userEmail}
        isOpen={otpModalOpen}
        onVerify={handleVerifyOTP}
        onClose={() => setOtpModalOpen(false)}
        type="password_reset"
      />
    </div>
  )
}
