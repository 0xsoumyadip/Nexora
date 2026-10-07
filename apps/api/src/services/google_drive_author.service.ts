import { getGoogleDriveClient } from "./google_drive_client.service.ts";

export async function createGoogleDriveFile (userId: string, name: string) {
    const drive = await getGoogleDriveClient(userId);

    const response = await drive.files.create({
        requestBody: {
            name,
            mimeType: "application/vnd.google-apps.document"
        },
        fields: "id,name,webViewLink"
    });

    if (!response.data.id) {
        throw new Error("Google Drive did not return a file ID.");
    }

    return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink
    }
}
