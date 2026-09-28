import { AppShell } from "@/features/app-shell";
import { auth } from "@nexora/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
