import { DocumentBrowser } from "@/features/browser";
import { getCurrentSession } from "@/lib/session";

export default async function Page() {
  const session = await getCurrentSession()
  const userName =
    typeof session?.user.userName === "string" ? session.user.userName : "";

  return <DocumentBrowser scope="all" userName={userName} />;
}
