import type { Request, Response } from "express";
import { auth } from "@nexora/auth/auth";
import { createUserSchema } from "@nexora/validation";

export const resendVerificationOTP = async (req: Request, res: Response) => {
  const email = req.body?.email;
  if (
    typeof email !== "string" ||
    !createUserSchema.shape.email.safeParse(email).success
  ) {
    return res.status(400).json({
      status: false,
      message: "Enter a valid email address.",
    });
  }

  try {
    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "email-verification",
      },
    });

    return res.status(200).json({
      status: true,
      message: "If that account needs verification, a code has been sent.",
    });
  } catch (error) {
    console.error("Resend verification code failed:", error);
    return res.status(500).json({
      status: false,
      message: "Unable to send a verification code right now.",
    });
  }
};
