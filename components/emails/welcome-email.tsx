import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

type WelcomeEmailProps = {
  confirmationUrl: string;
};

export function WelcomeEmail({ confirmationUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={card}>
          <Text style={logo}>Travel Exchange</Text>

          <Text style={heading}>Confirm your email</Text>

          <Text style={paragraph}>
            You just signed up for Travel Exchange. Tap the button below to
            verify your email and start tracking your currency purchases.
          </Text>

          <Section style={buttonRow}>
            <Button style={button} href={confirmationUrl}>
              Confirm Email Address
            </Button>
          </Section>

          <Text style={fallback}>
            Button not working? Copy and paste this link into your browser:
          </Text>
          <Text style={link}>{confirmationUrl}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you did not create this account, you can safely ignore this
            email. This link expires in 24 hours.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// -- Inline styles (email clients ignore external CSS) -----------------------

const body: React.CSSProperties = {
  margin: 0,
  padding: "40px 16px",
  backgroundColor: "#09090b",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const card: React.CSSProperties = {
  maxWidth: "480px",
  margin: "0 auto",
  backgroundColor: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "12px",
  padding: "32px",
};

const logo: React.CSSProperties = {
  margin: "0 0 24px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#fafafa",
  letterSpacing: "-0.01em",
};

const heading: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#fafafa",
  lineHeight: "1.3",
};

const paragraph: React.CSSProperties = {
  margin: "0 0 24px",
  fontSize: "14px",
  lineHeight: "1.7",
  color: "#a1a1aa",
};

const buttonRow: React.CSSProperties = {
  margin: "0 0 24px",
};

const button: React.CSSProperties = {
  display: "inline-block",
  padding: "14px 32px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#ffffff",
  backgroundColor: "#3b82f6",
  borderRadius: "10px",
  textDecoration: "none",
};

const fallback: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#71717a",
};

const link: React.CSSProperties = {
  margin: "0 0 24px",
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#3b82f6",
  wordBreak: "break-all",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #27272a",
  margin: "0 0 16px",
};

const footer: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  lineHeight: "1.6",
  color: "#52525b",
};
