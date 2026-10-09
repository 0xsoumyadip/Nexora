import { DocumentBrowser } from "@/features/browser";
import { getCurrentSession } from "@/lib/session";

export default async function Page() {

  return <DocumentBrowser scope="all" />;
}
