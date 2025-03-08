import { Resend } from 'resend'
import VerificationEmail from '@/emails/verification-email'
import OTPEmail from '@/emails/otp'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${token}`

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Verify your Exchange account',
      react: VerificationEmail({ verificationLink }) as React.ReactElement,
    })
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

export async function sendOTPEmail(to: string, code: string, type: "login" | "password_reset" | "withdraw") {
  const typeMessages = {
    login: "Login Verification Code",
    password_reset: "Password Reset Code",
    withdraw: "Withdrawal Verification Code"
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: typeMessages[type],
    react: OTPEmail({ code, type }) as React.ReactElement
  })
}