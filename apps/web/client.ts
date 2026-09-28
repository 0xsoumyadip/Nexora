const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configure.");
}

type ApiErrorBody = {
  message?: string;
  error?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("content-type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const body: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    const message = errorBody?.message ?? `Response failed(${response.status})`;

    throw new ApiError(message, errorBody?.error);
  }

  return body as T;
}
