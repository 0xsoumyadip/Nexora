import { DocumentBrowser } from "@/features/browser";
import { auth } from "@nexora/auth/auth";
import { headers } from "next/headers";

export default async function Page() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  return <DocumentBrowser scope="all" dashboard userName={session?.user.userName ?? " "} />;
}
