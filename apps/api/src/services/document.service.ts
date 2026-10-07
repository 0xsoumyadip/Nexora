import { getGoogleDriveConnection } from "./google-drive.service.ts";

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