import { Router } from "express";
import { createDocument } from "../controllers/document/createDocument.controller.ts";
import { verifySession } from "../middlewares/auth.middleware.ts";
import { getDocument, renameDocument } from "../controllers/document/document.controller.ts";

const router: Router = Router();

router.post("/", verifySession, createDocument);
router.get("/:documentId", verifySession, getDocument);
router.patch("/:documentId", verifySession, renameDocument);

export default router;
