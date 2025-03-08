"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import type { GeetestValidateResult, GeetestCaptcha } from '@/types/geetest'

interface GeetestProps {
  onSuccess: (result: GeetestValidateResult) => void
  onError: () => void
}

export type { GeetestValidateResult } // Re-export for convenience

export function Geetest({ onSuccess, onError }: GeetestProps) {
  const [isReady, setIsReady] = useState(false)
  const captchaRef = useRef<GeetestCaptcha | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.initGeetest4) return

    window.initGeetest4({
      captchaId: process.env.NEXT_PUBLIC_GEETEST_ID!,
      product: "bind",
      language: "en"
    }, (captcha) => {
      captchaRef.current = captcha

      captcha.onReady(() => {
        setIsReady(true)
      })

      captcha.onSuccess(() => {
        const result = captcha.getValidate()
        onSuccess(result)
      })

      captcha.onError(() => {
        console.error("Geetest error")
        onError()
      })

      captcha.onClose(() => {
        // Silent close handler
      })
    })

    return () => {
      if (captchaRef.current) {
        try {
          captchaRef.current.destroy()
          captchaRef.current = null
        } catch (error) {
          console.error("Error destroying captcha:", error instanceof Error ? error.message : String(error))
        }
      }
    }
  }, [onSuccess, onError])

  const handleClick = () => {
    if (captchaRef.current && isReady) {
      captchaRef.current.showCaptcha()
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 font-medium"
      onClick={handleClick}
      disabled={!isReady}
    >
      <Shield className="mr-2 h-4 w-4" />
      Verify Captcha
    </Button>
  )
}