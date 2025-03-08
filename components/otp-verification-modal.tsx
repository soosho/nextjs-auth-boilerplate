"use client"

import { FormEvent, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface OTPVerificationModalProps {
  email: string
  isOpen: boolean
  onVerify: (code: string) => Promise<boolean>
  onClose: () => void
}

export function OTPVerificationModal({
  email,
  isOpen,
  onVerify,
  onClose
}: OTPVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [codeSent, setCodeSent] = useState(false)
  const inputs = Array(6).fill(0)

  const handleSendOTP = async () => {
    setIsSending(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type: 'login'
        })
      })

      if (response.ok) {
        toast.success("Verification code sent")
        setCodeSent(true)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to send verification code")
      }
    } catch {
      toast.error("Failed to send verification code")
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent pasting multiple numbers

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!codeSent) {
      toast.error("Please request a verification code first")
      return
    }
    
    setIsLoading(true)
    try {
      const fullCode = code.join("")

      if (fullCode.length !== 6) {
        toast.error("Please enter all 6 digits")
        return
      }

      // Call onVerify directly - remove local verification
      const success = await onVerify(fullCode)
      if (success) {
        onClose()
      }

    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error("Failed to verify code")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Security Verification</DialogTitle>
          <DialogDescription>
            {codeSent 
              ? `Enter the 6-digit code sent to ${email}`
              : "Click the button below to receive a verification code"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!codeSent ? (
            <Button
              type="button"
              onClick={handleSendOTP}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {inputs.map((_, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    className="w-10 h-10 text-center text-lg"
                    value={code[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    required
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={isSending || isLoading}
                >
                  Resend Code
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || code.some(digit => !digit)}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}