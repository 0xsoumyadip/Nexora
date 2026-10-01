import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Resend api key is not set.");
}

export const resned = new Resend(process.env.RESEND_API_KEY);

interface sendVerificationEmailParams {
  to: string;
  verificationUrl: string;
  userName?: string | null;
}

export async function sendVerificationEmail({
  to,
  verificationUrl,
  userName,
}: sendVerificationEmailParams) {
  const { data, error } = await resned.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: "Verify your nexora email",
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Welcome to Nexora${userName ? `, ${userName}` : ""}!</h1>

          <p>
            Please verify your email address to continue using Nexora.
          </p>

          <a href="${verificationUrl}">
            Verify your email
          </a>

          <p>
            This verification link will expire soon.
          </p>
        </body>
      </html>
    `,
  });

  if(error) {
    console.error("Resend email: ", error);

    throw new Error("Unable to send verification email.")
  }

  return data;
}
