import type { Request, Response } from "express";
import { googleOAuth2Client } from "../../config/google-drive.oauth.ts";
import { googleDriveCallbackSchema } from "@nexora/validation";
import {
  createGoogleOAuthState,
  saveGoogleDriveConnection,
  verifyGoogleOAuthState,
} from "../../services/google-drive.service.ts";
import prisma from "@nexora/database";

export async function connectGoogleDrive(req: Request, res: Response) {
  try {
    console.log("Hit the route");
    const userId = req.auth.user.id;

    const state = await createGoogleOAuthState(userId);

    const authUrl = googleOAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/drive.file"],
      state,
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.log("Google OAuth error: ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}

export async function googleDriveCallback(req: Request, res: Response) {
  try {
    const parsedData = googleDriveCallbackSchema.safeParse(req.query);

    if (!parsedData.success) {
      return res.status(403).json({
        status: false,
        message: "Invalid code and state",
      });
    }

    const { code, state } = parsedData.data;

    const oauthState = await verifyGoogleOAuthState(state);

    const userId = oauthState.userId;

    const { tokens } = await googleOAuth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Google did not return the required tokens.");
    }

    await saveGoogleDriveConnection(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date ?? null,
    });

    await prisma.googleOAuthState.delete({
        where: {
            id: oauthState.id
        }
    });

     return res.redirect(
      `${process.env.WEB_URL}/documents/new?googleDrive=connected`,
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}
