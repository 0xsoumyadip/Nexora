import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/constants";

export function NewDocument() {
  return <div className="app-content new-doc">
    <Link className="btn ghost" href={routes.dashboard}><ArrowLeft size={16} /> Back to dashboard</Link>
    <div className="page-title" style={{ marginTop: 24 }}><div><h1>Create a new document</h1><p>Start with a blank page and write freely.</p></div></div>
    <div className="new-card"><span className="doc-icon"><FileText size={22} /></span><h2>Blank document</h2><p>Start with an empty page and shape it around the work in front of you.</p><button className="btn full" type="button">Create document</button></div>
    <div className="disabled-options"><div className="disabled-option"><b>Start from template</b><br /><small>Coming soon</small></div><div className="disabled-option"><b>Import file</b><br /><small>Coming soon</small></div></div>
  </div>;
}
