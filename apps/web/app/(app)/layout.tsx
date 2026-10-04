import { AppShell } from "@/features/app-shell";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if(!session.user.emailVerified){
    redirect("/verifyEmail");
  }

  return <AppShell user={{ name: session.user.name, email: session.user.email }}>{children}</AppShell>;
}
