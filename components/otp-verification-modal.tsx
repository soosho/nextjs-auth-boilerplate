"use client"

import { FormEvent, useState, useEffect } from "react" // Added useEffect
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

// Cooldown period in seconds
const RESEND_COOLDOWN = 120; // 1 minute cooldown

interface OTPVerificationModalProps {
  email: string
  isOpen: boolean
  onVerify: (code: string) => Promise<boolean>
  onClose: () => void
  type?: "login" | "password_reset" | "withdraw"
}

export function OTPVerificationModal({
  email,
  isOpen,
  onVerify,
  onClose,
  type = "login"
}: OTPVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [codeSent, setCodeSent] = useState(false)
  const inputs = Array(6).fill(0)
  
  // Rate limiting states
  const [cooldownActive, setCooldownActive] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  
  // Effect to handle the countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (cooldownActive && cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownActive, cooldownRemaining]);

  const handleSendOTP = async () => {
    // Don't allow sending if cooldown is active
    if (cooldownActive) return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type
        })
      });

      if (response.ok) {
        toast.success("Verification code sent");
        setCodeSent(true);
        
        // Start cooldown after successful send
        setCooldownActive(true);
        setCooldownRemaining(RESEND_COOLDOWN);
        
        // Store the timestamp in localStorage to persist across refreshes
        localStorage.setItem(`otp_last_sent_${email}`, Date.now().toString());
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send verification code");
      }
    } catch {
      toast.error("Failed to send verification code");
    } finally {
      setIsSending(false);
    }
  };

  // Check for existing cooldown when component mounts
  useEffect(() => {
    if (isOpen) {
      const lastSentTimestamp = localStorage.getItem(`otp_last_sent_${email}`);
      
      if (lastSentTimestamp) {
        const elapsed = Math.floor((Date.now() - parseInt(lastSentTimestamp)) / 1000);
        const remaining = RESEND_COOLDOWN - elapsed;
        
        if (remaining > 0) {
          setCooldownActive(true);
          setCooldownRemaining(remaining);
        }
      }
    }
  }, [isOpen, email]);

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

  // Format the remaining time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
              disabled={isSending || cooldownActive}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : cooldownActive ? (
                `Resend available in ${formatTime(cooldownRemaining)}`
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
                  disabled={isSending || isLoading || cooldownActive}
                >
                  {cooldownActive ? (
                    `Resend in ${formatTime(cooldownRemaining)}`
                  ) : (
                    "Resend Code"
                  )}
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