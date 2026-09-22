import prisma from "@nexora/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { comparePassword, hashedPassword } from "./bcrypt.js";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    user: {
        additionalFields: {
            userName: {
                type: "string",
                required: true
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        minPasswordLength: 6,
        requireEmailVerification: false,
        password: {
            hash: hashedPassword,
            verify: comparePassword
        }
    },
    session:{
        expiresIn: 24 * 60 * 60
    },
    plugins: [
        nextCookies()
    ]
})

export type Auth = typeof auth;