import prisma from "@nexora/database";
import crypto from "node:crypto";

export async function getGoogleDriveConnection(userId: string) {
  return await prisma.googleDriveConnection.findUnique({
    where: {
      userId,
    },
  });
}

export async function isGoogleDriveConnected(userId: string) {
  const connection = await getGoogleDriveConnection(userId);
  return connection !== null;
}

export async function createGoogleOAuthState(userId: string) {
  const state = crypto.randomBytes(32).toString("hex");

  const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

  const result = await prisma.googleOAuthState.create({
    data: {
      state,
      userId,
      expiryDate,
    },
  });

  if (!result) {
    throw new Error("Can not store state in db.");
  }

  return state;
}

export async function verifyGoogleOAuthState(state: string) {
  const oauthState = await prisma.googleOAuthState.findUnique({
    where: {
      state,
    },
  });

  if (!oauthState) {
    throw new Error("Invalid oauth state.");
  }

  if (oauthState.expiryDate < new Date()) {
    await prisma.googleOAuthState.delete({
      where: {
        id: oauthState.id,
      },
    });

    throw new Error("Expired oauth state.");
  }

  return oauthState;
}

export async function saveGoogleDriveConnection(
  userId: string,
  tokens: {
    access_token: string | null;
    refresh_token: string | null;
    expiry_date: number | null;
  },
) {
  if (!tokens.access_token) {
    throw new Error("Google Drive access token is required.");
  }

  if (!tokens.refresh_token) {
    throw new Error("Goodle Drive refresh token is required.");
  }

  const expiryDate =
    tokens.expiry_date != null ? new Date(tokens.expiry_date) : null;

  if (expiryDate && Number.isNaN(expiryDate.getTime())) {
    throw new Error("Google returned an invalid token expiry date.");
  }

  const result = await prisma.googleDriveConnection.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate
    },
  });

  return result;
}
