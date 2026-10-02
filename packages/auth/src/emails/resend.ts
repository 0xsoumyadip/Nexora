import { Resend } from "resend";

let resendClient: Resend | undefined;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend API key is not set.");
  }

  resendClient ??= new Resend(apiKey);
  return resendClient;
}

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
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("Resend sender email is not set.");
  }

  const { data, error } = await getResendClient().emails.send({
    from,
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
