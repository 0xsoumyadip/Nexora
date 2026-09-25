import { Router } from "express";
import { uploadFile } from "../controllers/upload/upload.controller.ts";
import { verifySession } from "../middlewares/auth.middleware.ts";
import { upload } from "../middlewares/multer.middleware.ts";

const router: Router = Router();

router.post("/upload", verifySession, upload.single("file"), uploadFile);

export default router;
