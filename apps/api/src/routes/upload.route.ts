import { Router } from "express";
import { verifySession } from "../middlewares/auth.middleware.ts";

const router: Router = Router();

router.post("/upload", verifySession, upload.single("file"), uploadFile);

export default router;
