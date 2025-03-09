import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Img
} from '@react-email/components'
import { siteConfig } from "@/config/site"

export default function VerificationEmail({
  verificationLink,
}: {
  verificationLink: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {siteConfig.name} - Verify your email</Preview>
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
            <Heading style={h1}>Verify Your Email</Heading>
          </Section>
          
          <Section style={section}>
            <Text style={text}>
              Welcome to {siteConfig.name}! We&apos;re excited to have you join us.
            </Text>
            
            <Text style={text}>
              To get started, please verify your email address by clicking the button below:
            </Text>
            
            <Link
              href={verificationLink}
              target="_blank"
              style={button}
            >
              Verify Email Address
            </Link>
            
            <Text style={text}>
              Or copy and paste this URL into your browser:
              <br />
              <span style={link as React.CSSProperties}>{verificationLink}</span>
            </Text>
            
            <Hr style={divider} />
            
            <Text style={infoText}>
              <strong>What happens next?</strong>
              <br />
              Once verified, you&apos;ll have full access to your account and all our features.
            </Text>
            
            <Text style={securityNote}>
              This verification link will expire in 24 hours. For your security, please don&apos;t share this email with anyone.
            </Text>
            
            <Text style={footer}>
              If you didn&apos;t create an account with {siteConfig.name}, you can safely ignore this email.
            </Text>
          </Section>
          
          {/* Footer with company info */}
          <Section style={footerSection}>
            <Text style={smallText}>
              Need help? Contact our support team at{" "}
              <Link href={`mailto:${siteConfig.support}`} style={linkStyle}>
                {siteConfig.support}
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
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '30px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '5px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
  margin: '0 auto',
  maxWidth: '600px',
}

const headerStyle = {
  padding: '20px 20px 0',
  textAlign: 'center' as const,
}

const section = {
  padding: '0 40px 30px',
}

const h1 = {
  color: '#333333',
  fontSize: '26px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '30px 0 15px',
  textAlign: 'center' as const,
}

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '5px',
  color: '#ffffff',
  display: 'block',
  fontSize: '16px',
  fontWeight: '700',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '100%',
  margin: '30px 0',
  border: '0',
}

const link = {
  color: '#0070f3',
  fontSize: '14px',
  textDecoration: 'none',
  wordBreak: 'break-all',
  display: 'inline-block',
  marginTop: '10px',
}

const divider = {
  borderColor: '#e6e6e6',
  margin: '25px 0 20px',
}

const infoText = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  textAlign: 'left' as const,
}

const securityNote = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '12px',
  backgroundColor: '#fff8e1',
  borderLeft: '4px solid #ffc107',
  margin: '20px 0',
  textAlign: 'left' as const,
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '30px 0 0',
  textAlign: 'center' as const,
}

const footerSection = {
  borderTop: '1px solid #e6e6e6',
  padding: '20px 40px',
  textAlign: 'center' as const,
}

const smallText = {
  color: '#888888',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '4px 0',
  textAlign: 'center' as const,
}

const linkStyle = {
  color: '#0070f3',
  textDecoration: 'underline',
}