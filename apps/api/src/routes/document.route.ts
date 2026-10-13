import { Router } from "express";
import { createDocument } from "../controllers/document/createDocument.controller.ts";
import { verifySession } from "../middlewares/auth.middleware.ts";
import {
  getAllDocuments,
  getDocument,
  openDocumet,
  renameDocument,
  shareDocumentLink,
  starDocument,
} from "../controllers/document/document.controller.ts";
import {
  deleteAllDocumentsPermanently,
  deleteDocumentPermanently,
  trashDocument,
} from "../controllers/document/deleteDocument.controller.ts";

const router: Router = Router();

router.post("/", verifySession, createDocument);
router.get("/:documentId", verifySession, getDocument);
router.get("/", verifySession, getAllDocuments);
router.patch("/:documentId", verifySession, renameDocument);
router.patch("/:documentId/open", verifySession, openDocumet);
router.patch("/:documentId/trash", verifySession, trashDocument);
router.patch("/:documentId/star", verifySession, starDocument);
router.post("/:documentId/share", verifySession, shareDocumentLink);
router.delete("/:documentId/delete", verifySession, deleteDocumentPermanently);
router.delete("/delete", verifySession, deleteAllDocumentsPermanently);

export default router;
