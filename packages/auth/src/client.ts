import { createAuthClient } from "better-auth/react";
import { config } from "dotenv";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL
});

export const { signUp } = authClient;

export type AuthClient = typeof authClient;