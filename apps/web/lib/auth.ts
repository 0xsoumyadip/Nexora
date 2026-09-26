import { apiRequest } from "@/client.js";

type ApiRequest = {
    status: boolean;
    message: string;
}

export type SignUpInput = {
    name: string;
    userName: string;
    email: string;
    password: string;
    image?: string;
}

export type SignInInput = {
    email: string;
    password: string;
}

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