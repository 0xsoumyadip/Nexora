import { Request, Response } from "express";
import { signInUserSchema } from "@nexora/validation";
import prisma from "@nexora/database";
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
  try {
    const parsedData = signInUserSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        status: false,
        message: "Invalid input data while sign in.",
        error: parsedData.error.flatten().fieldErrors
      });
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if(!user) {
        return res.status(404).json({
            status: false,
            message: "You have to sign up first."
        })
    }

    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
        body: {
            email,
            password
        }
    });

    for(const cookie of headers.getSetCookie()){
      res.append("Set-Cookie", cookie)
    }

    return res.status(201).json({
        status: true,
        message: "Sign in successfully."
    })
    
  } catch (error) {
    console.error("Sign in error: ", error);

    if (isAuthApiError(error)) {
      const isUnverified = error.body?.code === "EMAIL_NOT_VERIFIED";
      return res.status(isUnverified ? 403 : error.statusCode).json({
        status: false,
        message: isUnverified
          ? "Please verify your email before signing in. A new verification email has been sent if needed."
          : error.message,
      });
    }

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
