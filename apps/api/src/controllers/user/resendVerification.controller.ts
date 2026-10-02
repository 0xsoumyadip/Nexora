import type { Request, Response } from "express";
import { auth } from "@nexora/auth/auth";
import { createUserSchema } from "@nexora/validation";

export const resendVerification = async (req: Request, res: Response) => {
  const email = req.body?.email;
  if (typeof email !== "string" || !createUserSchema.shape.email.safeParse(email).success) {
    return res.status(400).json({
      status: false,
      message: "Enter a valid email address.",
    });
  }

  try {
    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: `${process.env.WEB_URL ?? "http://localhost:3000"}/verifyEmail?verified=1`,
      },
    });

    return res.status(200).json({
      status: true,
      message: "If that account needs verification, an email has been sent.",
    });
  } catch (error) {
    console.error("Resend verification email failed:", error);
    return res.status(500).json({
      status: false,
      message: "Unable to send a verification email right now.",
    });
  }
};
