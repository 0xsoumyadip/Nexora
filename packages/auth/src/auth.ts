import prisma from "@nexora/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { comparePassword, hashedPassword } from "./bcrypt.js";
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail } from "./emails/resend.js";

export const auth = betterAuth({
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
    expiresIn: 60 * 60,
    async sendVerificationEmail({ user, url }) {
      await sendVerificationEmail({
        to: user.email,
        verificationUrl: url,
        userName: user.name,
      }).catch((error) => console.error("Verification failed: ", error));
    },
  },
  session: {
    expiresIn: 24 * 60 * 60,
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
