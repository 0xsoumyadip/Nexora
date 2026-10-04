import prisma from "@nexora/database";

export async function getGoogleDriveConnection(userId: string) {
    return await prisma.googleDriveConnection.findUnique({
        where: {
            id: userId
        }
    });
};

export async function isGoogleDriveConnected(userId: string) {
    const connection = await getGoogleDriveConnection(userId);

    return connection !== null;
}