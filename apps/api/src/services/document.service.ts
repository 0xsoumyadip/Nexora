import { getGoogleDriveConnection } from "./google-drive.service.ts";
import { getGoogleDriveClient } from "./google_drive_client.service.ts";

export async function createGoogleDriveDocument (userId: string) {
    const googleDriveConnection = await getGoogleDriveConnection(userId);

    if(!googleDriveConnection) {
        return {
            requiredGoogleDriveConnection: true,
            connection: null
        }
    }

    return {
        requireGoogleDriveConnection: false,
        connection: googleDriveConnection
    }
}

export async function trashGoogleDriveDocument(userId: string, fileId: string): Promise<void>{
    const drive = await getGoogleDriveClient(userId);

    await drive.files.update({
        fileId,
        requestBody: {
            trashed: true
        }
    })
}

export async function deleteGoogleDrivePermanently(userId: string, fileId: string): Promise<void> {
    const drive = await getGoogleDriveClient(userId);

    await drive.files.delete({
        fileId
    });
}

export async function deleteAllGoogleDriveFilePermanently(userId: string): Promise<void> {
    const drive = await getGoogleDriveClient(userId);

    await drive.files.emptyTrash({});
}
