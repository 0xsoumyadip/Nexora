import Link from "next/link";
import { ArrowLeft, Bold, Check, Code2, FileText, Italic, Link2, List, ListOrdered, MoreHorizontal, Redo2, Share2, Undo2 } from "lucide-react";
import { routes } from "@/lib/constants";

const tools = [[Bold, "Bold"], [Italic, "Italic"], [List, "Bulleted list"], [ListOrdered, "Numbered list"], [Code2, "Code block"], [Link2, "Add link"]] as const;

export function Editor() {
  return <main className="editor">
    <header className="editor-top"><Link className="icon-button" href={routes.dashboard} aria-label="Back to dashboard"><ArrowLeft size={18} /></Link><FileText size={16} className="muted" /><input className="editor-title" aria-label="Document title" defaultValue="Project brief" /><span className="sync"><Check size={15} /><span>Saved</span></span><span className="collabs" aria-label="Maya Chen and Noah Williams are viewing"><span className="avatar">MC</span><span className="avatar">NW</span></span><button type="button" className="btn"><Share2 size={16} />Share</button><button className="icon-button" type="button" aria-label="More document options"><MoreHorizontal size={18} /></button></header>
    <nav className="editor-toolbar" aria-label="Editor toolbar"><button className="tool" type="button" aria-label="Undo"><Undo2 size={16} /></button><button className="tool" type="button" aria-label="Redo"><Redo2 size={16} /></button><i className="tool-sep" />{tools.map(([Icon, label]) => <button className="tool" type="button" aria-label={label} title={label} key={label}><Icon size={16} /></button>)}</nav>
    <section className="editor-desk"><article className="paper doc-prose"><h1>Project brief</h1><p>This is a focused space for the details that move work forward. The editor surface is ready for your rich-text engine.</p><h2>What we&apos;re solving</h2><p>We need a shared view of priorities, decisions, and the people responsible for the next step.</p><blockquote>Good collaboration makes the next decision clearer, not louder.</blockquote><h2>Next steps</h2><ul><li>Confirm the scope with the project team.</li><li>Capture feedback directly in the document.</li><li>Turn the decision into a small, owned action.</li></ul><pre>status: ready for review</pre></article></section>
  </main>;
}
