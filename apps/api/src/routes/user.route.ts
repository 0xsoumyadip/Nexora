import { Router } from "express";
import { signUp } from "../controllers/user/signUp.controller.ts";
import { signIn } from "../controllers/user/signIn.controller.ts";
import { resendVerification } from "../controllers/user/resendVerification.controller.ts";

const router: Router = Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.post("/auth/send-verification-email", resendVerification);


export default router;