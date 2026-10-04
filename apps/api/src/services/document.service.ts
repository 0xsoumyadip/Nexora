import prisma from "@nexora/database";
import { getGoogleDriveConnection } from "./google-drive.service.ts";

export async function createGoogleDriveDocument (userId: string) {
    const googleDriveConnection = await getGoogleDriveConnection(userId);

    if(!googleDriveConnection) {
        return {
            requiredGoogleDriveConnection: true
        }
    }

    return {
        requireGoogleDriveConnection: false
    }
}