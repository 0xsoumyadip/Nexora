import { Request, Response, NextFunction } from "express";
import { auth } from "@nexora/auth/auth";

export const verifySession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(" ") : value);
      }
    }

    const session = await auth.api.getSession();
    if (!session) {
      res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    req.auth = session;
    next();
  } catch (error) {
    console.error("Authentication error: ", error);
    res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};
