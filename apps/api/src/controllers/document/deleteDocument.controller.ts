import type { Request, Response } from "express";
import prisma from "@nexora/database";
import {
    deleteAllGoogleDriveFilePermanently,
  deleteGoogleDrivePermanently,
  trashGoogleDriveDocument,
} from "../../services/document.service.ts";

export async function trashDocument(req: Request, res: Response) {
  const documentId = req.params.documentId;
  if (typeof documentId !== "string") {
    return res.status(400).json({
      success: false,
      message: "A document id is required.",
    });
  }

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          { authorId: req.auth.user.id },
          { lastEditedById: req.auth.user.id },
          {
            members: {
              some: {
                userId: req.auth.user.id,
              },
            },
          },
        ],
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found!!",
      });
    }

    await trashGoogleDriveDocument(
      req.auth.user.id,
      document.googleDriveFileId,
    );

    await prisma.document.update({
      where: {
        id: document.id,
        authorId: req.auth.user.id,
      },
      data: {
        trashed: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Document moved to trash enviornment.",
    });
  } catch (error) {
    console.error("Trased document error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteDocumentPermanently(req: Request, res: Response) {
  const documentId = req.params.documentId;
  if (typeof documentId !== "string") {
    return res.status(400).json({
      success: false,
      message: "A document id is required.",
    });
  }

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        trashed: true,
        OR: [
          { authorId: req.auth.user.id },
          { lastEditedById: req.auth.user.id },
          {
            members: {
              some: {
                userId: req.auth.user.id,
              },
            },
          },
        ],
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    await deleteGoogleDrivePermanently(
      req.auth.user.id,
      document.googleDriveFileId,
    );

    await prisma.document.delete({
      where: {
        id: documentId,
        authorId: req.auth.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Document deleted permanently.",
    });
  } catch (error) {
    console.log("Delete document error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export async function deleteAllDocumentsPermanently(
  req: Request,
  res: Response,
) {
  try {
    const documents = await prisma.document.findMany({
      where: {
        trashed: true,
        OR: [
          { authorId: req.auth.user.id },
          { lastEditedById: req.auth.user.id },
          {
            members: {
              some: {
                userId: req.auth.user.id,
              },
            },
          },
        ],
      },
    });

    if(!documents || documents.length === 0){
        return res.status(404).json({
            success: false,
            message: "No document found."
        })
    }
    await deleteAllGoogleDriveFilePermanently(req.auth.user.id);

    await prisma.document.deleteMany({
        where: {
            trashed: true,
            OR: [
          { authorId: req.auth.user.id },
          { lastEditedById: req.auth.user.id },
          {
            members: {
              some: {
                userId: req.auth.user.id,
              },
            },
          },
        ],
        }
    });

    return res.status(200).json({
        success: true,
        message: "All files deleted successfully."
    });
  } catch (error) {
    console.error("Delete all documents error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
