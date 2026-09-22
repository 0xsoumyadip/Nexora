import type { auth } from "@nexora/auth";

declare global {
    namespace Express {
        interface Request {
            auth: Awaited<ReturnType<typeof auth.api.getSession>> | null;
        }
    }
}

export{};