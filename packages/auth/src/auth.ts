import prisma from "@nexora/database";
import {
  betterAuth,
  type Auth as BetterAuthInstance,
  type BetterAuthOptions,
} from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { comparePassword, hashedPassword } from "./bcrypt.js";
import { nextCookies } from "better-auth/next-js";
import dotenv from "dotenv";
import { resolve } from "node:path";
import { sendVerificationOTP } from "./emails/resend.js";
import { emailOTP } from "better-auth/plugins";

dotenv.config({
  path: resolve(process.cwd(), "packages/auth/.env"),
  quiet: true,
});

type AppAuthOptions = BetterAuthOptions & {
  user: NonNullable<BetterAuthOptions["user"]> & {
    additionalFields: {
      userName: { type: "string"; required: true };
    };
  };
  plugins: [ReturnType<typeof nextCookies>, ReturnType<typeof emailOTP>];
};

const authOptions: AppAuthOptions = {
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
  session: {
    expiresIn: 24 * 60 * 60,
  },
  plugins: [
    nextCookies(),
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendVerificationOTP({ to: email, otp, type });
      },
    }),
  ],
};

export const auth: BetterAuthInstance<AppAuthOptions> = betterAuth(authOptions);

export type Auth = typeof auth;
