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
} from '@react-email/components'

export default function VerificationEmail({
  verificationLink,
}: {
  verificationLink: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Exchange - Verify your email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify Your Email</Heading>
          <Section style={section}>
            <Text style={text}>
              Thanks for signing up for Exchange! Please verify your email address to get started.
            </Text>
            <Link
              href={verificationLink}
              target="_blank"
              style={button}
            >
              Verify Email Address
            </Link>
            <Text style={text}>
              Or copy and paste this URL into your browser:<br />
              <span style={link}>{verificationLink}</span>
            </Text>
            <Text style={footer}>
              If you didn&apos;t create an account with Exchange, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '40px 0',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '10px',
  margin: '0 auto',
  padding: '40px',
  maxWidth: '600px',
}

const section = {
  padding: '0',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '5px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '100%',
  margin: '24px 0',
}

import { CSSProperties } from 'react';

const link: CSSProperties = {
  color: '#0070f3',
  fontSize: '14px',
  textDecoration: 'none',
  wordBreak: 'break-all',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
}