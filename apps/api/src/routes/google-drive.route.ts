import { Router } from "express";
import { connectGoogleDrive, googleDriveCallback } from "../controllers/gogole-drive/google-drive.controller.ts";

const router: Router = Router();

router.get("/connect", connectGoogleDrive);
router.get("/callback", googleDriveCallback);

export default router;