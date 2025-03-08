import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { siteConfig } from "@/config/site"

interface OTPEmailProps {
  code: string
  type: "login" | "password_reset" | "withdraw"
}

const typeMessages = {
  login: {
    subject: "Login Verification Code",
    title: "Login Verification Required",
    description: "Use this code to verify your login attempt:"
  },
  password_reset: {
    subject: "Password Reset Code",
    title: "Password Reset Requested",
    description: "Use this code to reset your password:"
  },
  withdraw: {
    subject: "Withdrawal Verification Code",
    title: "Withdrawal Verification Required",
    description: "Use this code to verify your withdrawal request:"
  }
}

export default function OTPEmail({ code, type }: OTPEmailProps) {
  const message = typeMessages[type]

  return (
    <Html>
      <Head />
      <Preview>{message.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{message.title}</Heading>
          <Section style={section}>
            <Text style={text}>{message.description}</Text>
            <Text style={codeStyle}>{code}</Text>
            <Text style={footer}>
              This code will expire in 10 minutes. If you didn&apos;t request this code,
              please ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
}

const section = {
  padding: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center" as const,
}

const h1 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "normal",
  textAlign: "center" as const,
  margin: "30px 0",
}

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
}

const codeStyle = {
  color: "#000",
  fontSize: "36px",
  fontWeight: "bold",
  margin: "20px 0",
  letterSpacing: "8px",
}

const footer = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "24px",
  marginTop: "30px",
}