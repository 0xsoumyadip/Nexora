import type { Request, Response } from "express";
import { createGoogleDriveDocument } from "../../services/document.service.ts";
import { isGoogleDriveConnected } from "../../services/google-drive.service.ts";
import { createGoogleDriveFile } from "../../services/google_drive_author.service.ts";
import prisma from "@nexora/database";

export async function createDocument(req: Request, res: Response) {
  try {
    const userId = req.auth.user.id;

    const connection = await isGoogleDriveConnected(userId);
    
    if (!connection) {
      return res.status(403).json({
        status: false,
        requireGoogleDriveConnection: true,
        message: "Google Drive connection is required.",
      });
    }

    const driveFile = await createGoogleDriveFile(userId, "Untitled Document");

    const document = await prisma.document.create({
      data: {
        name: "Untitled Document",
        googleDriveFileId: driveFile.id,
        authorId: userId
      }
    })
  
    return res.status(200).json({
      status: true,
      message: "Document created successfully.",
      document: {
        id: document.id,
        name: document.name,
        googleDriveFileId: document.googleDriveFileId
      }
    });
  } catch (error) {
    console.error("Create Document error: ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
}
