import { Router } from "express";
import { connectGoogleDrive, googleDriveCallback } from "../controllers/gogole-drive/google-drive.controller.ts";
import { verifySession } from "../middlewares/auth.middleware.ts";

const router: Router = Router();

router.get("/connect", verifySession, connectGoogleDrive);
router.get("/callback",verifySession, googleDriveCallback);

export default router;