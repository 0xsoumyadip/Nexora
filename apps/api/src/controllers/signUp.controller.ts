import { Request, Response } from "express";
import { userSchema } from "@nexora/validation";
import { auth } from "@nexora/auth/auth";
import prisma from "@nexora/database";

export const signUp = async (req: Request, res: Response) => {
  try {
    const parsedData = userSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        status: false,
        message: "Invalid inputs while signup",
        error: parsedData.error.flatten().fieldErrors,
      });
    }

    const { name, userName, email, password, image } = parsedData.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { userName: userName }],
      },
    });

    if (existingUser) {
      if (existingUser.email) {
        return res.status(409).json({
          status: false,
          message: "User already exists with this email.",
        });
      }
      if (existingUser.userName) {
        return res.status(409).json({
          status: false,
          message: "This user name is already taken.",
        });
      }
    }

    const user = await auth.api.signUpEmail({
      body: {
        name,
        userName,
        email,
        password,
        image,
      },
    });

    if (!user) {
      return res.status(402).json({
        status: false,
        message: "Registration failed",
      });
    }

    return res.status(201).json({
      status: true,
      message: "Registration successfull.",
    });
  } catch (error) {
    console.log("Sign Up error: ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
