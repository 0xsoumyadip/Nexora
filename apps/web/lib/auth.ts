import { ApiError, apiRequest } from "@/client";
import { authClient } from "@nexora/auth/client";

type ApiRequest = {
  status: boolean;
  message: string;
};

export type SignUpInput = {
  name: string;
  userName: string;
  email: string;
  password: string;
  image?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export function signUp(input: SignUpInput) {
  return apiRequest<ApiRequest>("/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function signIn(input: SignInInput) {
  return apiRequest<ApiRequest>("/signin", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyEmailOTP(email: string, otp: string) {
  return apiRequest<{ status: boolean }>("/api/auth/email-otp/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function sendVerificationOTP(email: string) {
  return apiRequest<ApiRequest>("/auth/send-verification-otp", {
    method: "POST",
    body: JSON.stringify({ email })
  })
}
