import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient, type ReactAuthClient } from "better-auth/react";

export const authClient: ReactAuthClient<{
    baseURL: string | undefined;
    plugins: [ReturnType<typeof emailOTPClient>];
}> = createAuthClient({
    // This entry point is imported by browser code, so it must only use
    // environment variables that Next.js can safely inline into the client.
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    plugins: [
        emailOTPClient()
    ]
});

export const { signUp, emailOtp, useSession } = authClient;

export type AuthClient = typeof authClient;
