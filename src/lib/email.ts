import { Resend } from "resend";
import { env } from "~/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  fromName?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  fromName,
  replyTo,
}: EmailOptions) {
  if (!resend) {
    console.warn("⚠️ Email not configured. Set RESEND_API_KEY to enable.");
    if (env.NODE_ENV === "development") {
      console.log(`\n📧 Email (Dev):\nTo: ${to}\nSubject: ${subject}\n`);
      return { success: true, id: "dev-email-id" };
    }
    return { success: false, error: "Email not configured" };
  }

  const fromAddress = env.RESEND_FROM_EMAIL ?? "noreply@mail.vesta-crm.com";
  const from = fromName
    ? `${fromName} <${fromAddress}>`
    : `Vesta <${fromAddress}>`;

  const result = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
    ...(replyTo && { replyTo }),
  });

  if (result.error) {
    console.error("❌ Resend API error:", result.error);
    throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
  }

  console.log(`✅ Email sent to ${to} (ID: ${result.data?.id})`);
  return { success: true, id: result.data?.id };
}
