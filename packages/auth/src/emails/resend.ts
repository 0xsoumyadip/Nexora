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

type VerificationOTPType =
  "sign-in" | "email-verification" | "forget-password" | "change-email";

interface SendVerificationOTPParams {
  to: string;
  otp: string;
  type: VerificationOTPType;
}

export async function sendVerificationOTP({
  to,
  otp,
  type,
}: SendVerificationOTPParams) {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("Resend sender email is not set.");
  }

  const emailCopy = {
    "email-verification": {
      subject: "Verify your Nexora email",
      message:
        "Use this code to verify your email address and continue using Nexora.",
    },
    "sign-in": {
      subject: "Your Nexora sign-in code",
      message: "Use this code to sign in to your Nexora account.",
    },
    "forget-password": {
      subject: "Your Nexora password reset code",
      message: "Use this code to reset your Nexora password.",
    },
    "change-email": {
      subject: "Your Nexora email change code",
      message: "Use this code to confirm your Nexora email change.",
    },
  }[type];

  const { data, error } = await getResendClient().emails.send({
    from,
    to,
    subject: emailCopy.subject,
    html: `
     <!DOCTYPE html>
      <html>
      <body>
        <h1>Welcome to Nexora!</h1>

        <p>
          ${emailCopy.message}
        </p>

        <h2>${otp}</h2>

        <p>
          This code expires in 5 minutes.
        </p>

        <p>
          If you didn't request this code, you can safely ignore this email.
        </p>
      </body>
  </html>

    `,
  });

  if (error) {
    console.error("Resend rejected verification email:", error);

    throw new Error("Unable to send verification email.");
  }

  console.info("Resend accepted verification email:", data?.id);

  return data;
}
