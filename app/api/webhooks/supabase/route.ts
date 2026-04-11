import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { WelcomeEmail } from "@/components/emails/welcome-email";

// -- Types -------------------------------------------------------------------

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    raw_user_meta_data: Record<string, unknown>;
  };
  old_record: null | Record<string, unknown>;
};

// -- Handler -----------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Verify webhook secret
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
    console.error("[webhook] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse payload
  const payload: WebhookPayload = await request.json();

  // Only process new user inserts on auth.users
  if (
    payload.type !== "INSERT" ||
    payload.schema !== "auth" ||
    payload.table !== "users"
  ) {
    return NextResponse.json({ message: "Ignored: not a user insert" });
  }

  // Skip OAuth signups (already confirmed)
  if (payload.record.email_confirmed_at) {
    console.log(
      `[webhook] Skipping ${payload.record.email}: already confirmed (OAuth)`,
    );
    return NextResponse.json({ message: "Already confirmed" });
  }

  const userEmail = payload.record.email;
  if (!userEmail) {
    return NextResponse.json({ error: "No email in record" }, { status: 400 });
  }

  console.log(`[webhook] New signup: ${userEmail}`);

  // 3. Initialize clients (lazy to avoid build-time env errors)
  const resend = new Resend(process.env.RESEND_API_KEY);

  // 4. Generate confirmation link via admin API
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    });

  if (linkError || !linkData) {
    console.error("[webhook] generateLink failed:", linkError);
    return NextResponse.json(
      { error: "Failed to generate link" },
      { status: 500 },
    );
  }

  // 5. Build confirmation URL pointing to our /auth/confirm route
  const { hashed_token } = linkData.properties;
  const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token_hash=${hashed_token}&type=magiclink`;

  console.log(`[webhook] Confirmation URL generated for ${userEmail}`);

  // 6. Send email via Resend
  const { error: emailError } = await resend.emails.send({
    from: `Travel Exchange <${process.env.RESEND_FROM_EMAIL}>`,
    to: userEmail,
    subject: "Confirm your Travel Exchange account",
    react: WelcomeEmail({ confirmationUrl }),
  });

  if (emailError) {
    console.error("[webhook] Email send failed:", emailError);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }

  console.log(`[webhook] Confirmation email sent to ${userEmail}`);
  return NextResponse.json({ message: "Email sent" });
}
