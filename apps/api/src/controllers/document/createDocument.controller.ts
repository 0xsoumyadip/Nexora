import type { Request, Response } from "express";
import { createGoogleDriveDocument } from "../../services/document.service.ts";
import { isGoogleDriveConnected } from "../../services/google-drive.service.ts";

export async function createDocument(req: Request, res: Response) {
  try {
    const userId = req.auth.user.id;

    const connection = await isGoogleDriveConnected(userId);
    console.log(connection);
    if (!connection) {
      return res.status(403).json({
        status: false,
        requireGoogleDriveConnection: true,
        message: "Google Drive connection is required.",
      });
    }

    const result = await createGoogleDriveDocument(userId);
    if(result.requireGoogleDriveConnection){
        return res.status(403).json({
            status: false,
            message: "Can not get google drive connection."
        })
    }
    console.log(result);
    return res.status(200).json({
      status: true,
      message: "Document created successfully.",
    });
  } catch (error) {
    console.error("Create Document error: ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
}
