import prisma from "@nexora/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { comparePassword, hashedPassword } from "./bcrypt.js";
import { nextCookies } from "better-auth/next-js";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { sendVerificationEmail } from "./emails/resend.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:8080",
  trustedOrigins: [process.env.WEB_URL ?? "http://localhost:3000"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      userName: {
        type: "string",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    requireEmailVerification: true,
    password: {
      hash: hashedPassword,
      verify: comparePassword,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    expiresIn: 60 * 60,
    async sendVerificationEmail({ user, url }) {
      await sendVerificationEmail({
        to: user.email,
        verificationUrl: url,
        userName: user.name,
      });
    },
  },
  session: {
    expiresIn: 24 * 60 * 60,
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
