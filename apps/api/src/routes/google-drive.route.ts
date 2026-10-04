import { Router } from "express";
import { connectGoogleDrive } from "../controllers/gogole-drive/google-drive.controller.ts";

const router: Router = Router();

router.get("/connect", connectGoogleDrive);

export default router;