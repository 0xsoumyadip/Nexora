import { Marketing } from "@/features/marketing";
import { auth } from "@nexora/auth/auth";
import { headers } from "next/headers";
import { routes } from "@/lib/constants";

export default async function Page() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  const destination = session ? routes.dashboard : routes.register;

  return <Marketing destination={destination} />;
}
