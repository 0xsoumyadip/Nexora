import { google } from "googleapis";
import { getGoogleDriveConnection } from "./google-drive.service.ts";

export async function getGoogleDriveClient (userId: string) {
    const connection = await getGoogleDriveConnection(userId);

    if(!connection) {
        throw new Error("Google Drive is not connected.");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
        expiry_date: connection.expiryDate?.getDate()
    });

    return google.drive({
        version: "v3",
        auth: oauth2Client
    })
}