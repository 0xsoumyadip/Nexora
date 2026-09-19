import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { routes } from "@/lib/constants";

export default function NotFound() {
  return <main className="status-page"><FileQuestion size={42} /><h1>That document is not here</h1><p>It may have been moved, deleted, or the link may be incomplete.</p><Link className="btn" href={routes.dashboard}>Go to dashboard</Link></main>;
}
