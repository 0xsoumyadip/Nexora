import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.ts";

export const authHandler = toNodeHandler(auth);