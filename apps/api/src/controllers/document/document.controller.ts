import prisma from "@nexora/database";
import type { Request, Response } from "express";
import { getGoogleDriveClient } from "../../services/google_drive_client.service.ts";

export async function findAccessableDocments(
  documentId: string,
  userId: string,
) {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      OR: [{ authorId: userId }, { lastEditedById: userId }],
    },
    select: {
      id: true,
      name: true,
      title: true,
      googleDriveFileId: true,
    },
  });
}

export async function getDocument(req: Request, res: Response) {
  const documentId = req.params.documentId;
  if (typeof documentId !== "string") {
    return res.json(403).json({
      status: false,
      message: "A document id is required.",
    });
  }

  try {
    const document = await findAccessableDocments(documentId, req.auth.user.id);
    if (!document) {
      return res.status(404).json({
        status: false,
        message: "Document not found.",
      });
    }

    return res.status(200).json({
      status: true,
      document: {
        id: document.id,
        name: document.name || "Untitled Document",
      },
    });
  } catch (error) {
    console.error("Get document error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function renameDocument(req: Request, res: Response) {
  const documentId = req.params.documentId;
  if (typeof documentId !== "string") {
    return res.status(403).json({
      status: false,
      message: "A document id is required.",
    });
  }

  const documentName = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!documentName || documentName.length > 120) {
    return res.status(402).json({
      status: false,
      message: "A title between 1 - 120 characters are required.",
    });
  }

  try {
    const document = await findAccessableDocments(documentId, req.auth.user.id);
    if (!document) {
      return res.status(404).json({
        status: false,
        message: "Document not found",
      });
    }

    const drive = await getGoogleDriveClient(req.auth.user.id);
    await drive.files.update({
      fileId: document.googleDriveFileId,
      requestBody: { name: documentName },
    });

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        name: documentName,
        title: documentName,
        lastEditedById: req.auth.user.id,
      },
      select: {
        id: true,
        name: true,
        title: true,
      },
    });

    return res.status(200).json({
      status: true,
      document: {
        id: updatedDocument.id,
        name: updatedDocument.name || "Untitled Document",
      },
    });
  } catch (error) {
    console.error("Rename document error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
