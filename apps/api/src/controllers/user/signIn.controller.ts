import { Request, Response } from "express";
import { signInUserSchema } from "@nexora/validation";
import { auth } from "@nexora/auth/auth";

type AuthApiError = {
  statusCode: number;
  body?: { code?: string };
  message: string;
};

function isAuthApiError(error: unknown): error is AuthApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

export const signIn = async (req: Request, res: Response) => {
  const parsedData = signInUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      status: false,
      message: "Invalid input data while signing in.",
      error: parsedData.error.flatten().fieldErrors,
    });
  }

  const { email, password } = parsedData.data;

  try {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email,
        password,
      },
    });

    for (const cookie of headers.getSetCookie()) {
      res.append("Set-Cookie", cookie);
    }

    return res.status(200).json({
      status: true,
      message: "Sign in successfully.",
    });
  } catch (error) {
    if (isAuthApiError(error)) {
      if (error.body?.code === "EMAIL_NOT_VERIFIED") {
        try {
          await auth.api.sendVerificationOTP({
            body: {
              email,
              type: "email-verification",
            },
          });

          return res.status(403).json({
            status: false,
            code: "EMAIL_NOT_VERIFIED",
            message: "Please verify your email. We sent you a verification code.",
          });
        } catch (otpError) {
          console.error("Failed to send verification code:", otpError);
          return res.status(503).json({
            status: false,
            code: "OTP_SEND_FAILED",
            message: "We couldn't send a verification code. Please try again.",
          });
        }
      }

      if (error.statusCode === 401) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password.",
        });
      }

      if (error.statusCode === 429) {
        return res.status(429).json({
          status: false,
          message: "Too many sign-in attempts. Please try again later.",
        });
      }
    }

    console.error("Sign-in failed:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};
