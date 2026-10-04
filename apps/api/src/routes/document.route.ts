import { Router } from "express";
import { createDocument } from "../controllers/document/createDocument.controller.ts";

const router: Router = Router();

router.post("/", createDocument);

export default router;