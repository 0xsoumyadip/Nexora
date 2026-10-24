import { randomBytes, createHash } from "node:crypto";

export const generateVerificationToken = () => {
  const token = randomBytes(32).toString("hex");

  const hashedToken = createHash("sha256").update(token).digest("hex");

  return {
    token,
    hashedToken,
  };
};

export const hashToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};
