import type { Request, Response } from "express";
import { googleOAuth2Client } from "../../config/google-drive.oauth.ts";

export function connectGoogleDrive( req: Request, res: Response) {
    const authUrl = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/drive.files"
        ]
    });

    res.redirect(authUrl);
}