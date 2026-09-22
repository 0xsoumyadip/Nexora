import { Request, Response } from "express";
import { userSchema } from "@nexora/validation";
import prisma from "@nexora/database";
import { auth } from "@nexora/auth/auth";

export const signIn = async (req: Request, res: Response) => {
  try {
    const parsedData = userSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        statsus: false,
        message: "Invalid input data while sign in.",
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
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
