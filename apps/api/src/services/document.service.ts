import prisma from "@nexora/database";
import { getGoogleDriveConnection } from "./google-drive.service.ts";

export async function createGoogleDriveDocument (userId: string) {
    const googleDriveConnection = await getGoogleDriveConnection(userId);
    console.log(googleDriveConnection);

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