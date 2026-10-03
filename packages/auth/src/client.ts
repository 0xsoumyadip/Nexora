import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient, type ReactAuthClient } from "better-auth/react";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url))});

export const authClient: ReactAuthClient<{
    baseURL: string | undefined;
    plugins: [ReturnType<typeof emailOTPClient>];
}> = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        emailOTPClient()
    ]
});

export const { signUp, emailOtp } = authClient;

export type AuthClient = typeof authClient;
