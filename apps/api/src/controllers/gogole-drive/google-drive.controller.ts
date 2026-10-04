import type { Request, Response } from "express";
import { googleOAuth2Client } from "../../config/google-drive.oauth.ts";
import { googleDriveCallbackSchema } from "@nexora/validation";

export function connectGoogleDrive( req: Request, res: Response) {
    const authUrl = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/drive.file"
        ]
    });

    res.redirect(authUrl);
}

export async function googleDriveCallback(req: Request, res: Response) {

    const { code } = req.query;
    if(!code || typeof code !== "string"){
        return res.status(403).json({
            status: false,
            message: "Authorization token is missing."
        })
    }
    
    try {
        const { tokens } = await googleOAuth2Client.getToken(code);

        console.log("Google token received successfully.");
        console.log({
            access_token: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry_date: tokens.expiry_date
        });

        return res.status(200).json({
            status: true,
            message: "Google token received successfully."
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
}