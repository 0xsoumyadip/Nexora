import { createAuthClient } from "better-auth/react";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url))});

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL
});

export const { signUp } = authClient;

export type AuthClient = typeof authClient;