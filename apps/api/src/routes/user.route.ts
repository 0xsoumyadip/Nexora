import { Router } from "express";
import { signUp } from "../controllers/user/signUp.controller.ts";
import { signIn } from "../controllers/user/signIn.controller.ts";
import { resendVerificationOTP } from "../controllers/user/resendVerification.controller.ts";

const router: Router = Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.post("/auth/send-verification-otp", resendVerificationOTP);

export default router;
