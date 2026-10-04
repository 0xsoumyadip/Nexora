import { auth } from "@nexora/auth/auth";
import { headers } from "next/headers";

export async function getCurrentSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
