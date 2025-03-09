import { Resend } from 'resend'
import VerificationEmail from '@/emails/verification-email'
import OTPEmail from '@/emails/otp'
import { siteConfig } from "@/config/site"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${token}`

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Verify your ${siteConfig.name} account`,
      react: VerificationEmail({ verificationLink }) as React.ReactElement,
      tags: [{ name: "category", value: "verification" }],
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high"
      }
    })
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

export async function sendOTPEmail(to: string, code: string, type: "login" | "password_reset" | "withdraw") {
  const typeMessages = {
    login: `Login Verification Code: ${code}`,
    password_reset: `Password Reset Code: ${code}`,
    withdraw: `Withdrawal Verification Code: ${code}`
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject: typeMessages[type],
      react: OTPEmail({ code, type }) as React.ReactElement,
      // Add priority headers and tags for better delivery
      tags: [{ name: "category", value: type }],
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high"
      }
    })
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw new Error('Failed to send OTP email')
  }
}