import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Img
} from "@react-email/components"
import { siteConfig } from "@/config/site"

interface OTPEmailProps {
  code: string
  type: "login" | "password_reset" | "withdraw"
}

const typeMessages = {
  login: {
    subject: "Login Verification Code: {code}",
    title: "Login Verification Required",
    description: "Use this code to verify your login attempt:",
    additionalInfo: "We detected a sign-in attempt to your account from a new device or location. For your security, please verify that this was you by entering the code below.",
    securityTip: "Never share this code with anyone. Our team will never ask for your verification code."
  },
  password_reset: {
    subject: "Password Reset Code: {code}",
    title: "Password Reset Requested",
    description: "Use this code to reset your password:",
    additionalInfo: "We received a request to reset your password. If you didn't make this request, you can ignore this email and your password will remain unchanged.",
    securityTip: "Choose a strong password that you don't use on other websites."
  },
  withdraw: {
    subject: "Withdrawal Verification Code: {code}",
    title: "Withdrawal Verification Required",
    description: "Use this code to verify your withdrawal request:",
    additionalInfo: "We noticed a withdrawal request from your account. To ensure that this transaction is authorized by you, please verify using the code below.",
    securityTip: "Always double-check withdrawal addresses before confirming any transaction."
  }
}

export default function OTPEmail({ code, type }: OTPEmailProps) {
  const message = typeMessages[type]
  const subject = message.subject.replace("{code}", code)

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={headerStyle}>
            {siteConfig.logo && (
              <Img
                src={`${siteConfig.logo}`}
                width="200"
                height="40"
                alt={siteConfig.name}
                style={{ margin: "0 auto", maxWidth: "100%" }}
              />
            )}
            <Heading style={h1}>{message.title}</Heading>
          </Section>
          
          <Section style={section}>
            {/* Context information */}
            <Text style={text}>
              Hello,
            </Text>
            
            <Text style={text}>
              {message.additionalInfo}
            </Text>
            
            {/* Verification code */}
            <Text style={text}>{message.description}</Text>
            <Text style={codeStyle}>{code}</Text>
            
            {/* Security information */}
            <Text style={securityNote}>
              {message.securityTip}
            </Text>
            
            <Hr style={divider} />
            
            <Text style={footer}>
              This code will expire in 10 minutes. If you didn&apos;t request this code,
              please disregard this email or contact support immediately if you believe 
              someone is attempting to access your account.
            </Text>
          </Section>
          
          {/* Footer with help text */}
          <Section style={footerSection}>
            <Text style={smallText}>
              Need help? Contact our support team at{" "}
              <Link href={`mailto:${siteConfig.support || "support@example.com"}`} style={link}>
                {siteConfig.support || "support@example.com"}
              </Link>
            </Text>
            
            <Text style={smallText}>
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </Text>
            
            <Text style={smallText}>
              {siteConfig.address}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
}

const headerStyle = {
  padding: "20px",
  textAlign: "center" as const,
}

const section = {
  padding: "24px",
  background: "#ffffff",
  border: "solid 1px #dedede",
  borderRadius: "5px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "16px 0",
}

const text = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  marginBottom: "16px",
}

const codeStyle = {
  color: "#000",
  fontSize: "36px",
  fontWeight: "bold",
  margin: "30px 0",
  textAlign: "center" as const,
  letterSpacing: "8px",
  backgroundColor: "#f2f2f2",
  padding: "16px",
  borderRadius: "4px",
}

const securityNote = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "12px",
  backgroundColor: "#fff8e1",
  borderLeft: "4px solid #ffc107",
  margin: "20px 0",
}

const divider = {
  borderColor: "#e6e6e6",
  margin: "20px 0",
}

const footer = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "20px",
  marginTop: "12px",
}

const footerSection = {
  textAlign: "center" as const,
  marginTop: "20px",
}

const smallText = {
  color: "#888",
  fontSize: "11px",
  lineHeight: "18px",
  margin: "4px 0",
}

const link = {
  color: "#2563eb",
  textDecoration: "underline",
}