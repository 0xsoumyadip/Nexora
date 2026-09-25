import { Router } from "express";
import { signUp } from "../controllers/user/signUp.controller.ts";
import { signIn } from "../controllers/user/signIn.controller.ts";

const router: Router = Router();

router.post("/signup", signUp);

router.post("/signin", signIn);


export default router;