import { Router } from "express";
import { createDocument } from "../controllers/document/createDocument.controller.ts";
import { verifySession } from "../middlewares/auth.middleware.ts";

const router: Router = Router();

router.post("/", verifySession, createDocument);

export default router;
