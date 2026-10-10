import { Router } from "express";
import { createDocument } from "../controllers/document/createDocument.controller.ts";
import { verifySession } from "../middlewares/auth.middleware.ts";
import { getAllDocuments, getDocument, openDocumet, renameDocument } from "../controllers/document/document.controller.ts";

const router: Router = Router();

router.post("/", verifySession, createDocument);
router.get("/:documentId", verifySession, getDocument);
router.get("/", verifySession, getAllDocuments);
router.patch("/:documentId", verifySession, renameDocument);
router.patch("/:documentId/open", verifySession, openDocumet);

export default router;
