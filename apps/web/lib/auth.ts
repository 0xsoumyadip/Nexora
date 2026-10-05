import { ApiError, apiRequest } from "@/client";

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
    body: JSON.stringify({ email }),
  });
}

type CreateDocumentResponse = ApiRequest & {
  requireGoogleDriveConnection?: boolean;
};

export async function createDocument() {
  try {
    const response = await apiRequest<CreateDocumentResponse>("/api/document", {
      method: "POST",
    });

    console.log(response);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const errorBody = error.responseBody as CreateDocumentResponse | undefined;
      if (error.status === 403 && errorBody?.requireGoogleDriveConnection) {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/google-drive/connect`;
        return;
      }

      console.error("Create document request failed:", error.status, error.message);
      return;
    }

    console.error("Failed to create document:", error);
  }
}
