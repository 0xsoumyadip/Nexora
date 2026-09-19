import Link from "next/link";
import { FileText, Grid2X2, List, MoreHorizontal, Search, Star, Trash2 } from "lucide-react";
import { routes } from "@/lib/constants";

const documents = [
  { id: "project-brief", title: "Project brief", excerpt: "The goals, context, and next decisions for the project.", updated: "2 hours ago", people: ["MC", "NW"] },
  { id: "research-notes", title: "Research notes", excerpt: "Customer interviews and the patterns emerging from them.", updated: "Yesterday", people: ["AM", "JR"] },
  { id: "team-retro", title: "Team retrospective", excerpt: "What worked well and what we want to improve next cycle.", updated: "3 days ago", people: ["MC"] },
  { id: "launch-plan", title: "Launch plan", excerpt: "A clear rollout plan for the upcoming release.", updated: "Last week", people: ["NW", "JR", "AM"] },
];
const copy = { all: ["My files", "All your documents, in one calm place."], recent: ["Recent", "Documents you open will appear here."], starred: ["Starred", "Your most important work, close at hand."], shared: ["Shared with me", "Work your teammates have shared with you."], trash: ["Trash", "Items in trash are deleted after 30 days."] } as const;

export function DocumentBrowser({ scope = "all", dashboard = false }: { scope?: keyof typeof copy; dashboard?: boolean }) {
  const [title, description] = copy[scope];
  return <div className="app-content">
    <div className="page-title"><div><h1>{dashboard ? "Good morning, Alex" : title}</h1><p>{dashboard ? "You have 4 documents · 3 shared with you" : description}</p></div><Link className="btn" href={routes.newDocument}><FileText size={16} />New file</Link></div>
    {dashboard && <><div className="recent-head"><h2 style={{ fontSize: 17 }}>Recent documents</h2><Link className="muted" href="/recent">View all</Link></div><div className="recent-strip">{documents.slice(0, 4).map((doc) => <Link className="recent-card" key={doc.id} href={routes.document(doc.id)}><span className="doc-icon"><FileText size={17} /></span><h3>{doc.title}</h3><small className="muted">Edited {doc.updated}</small></Link>)}</div></>}
    {scope === "trash" && <div className="trash-note"><Trash2 size={16} /> Items in trash are deleted after 30 days.</div>}
    <div className="toolbar"><div className="search"><Search size={16} /><input aria-label="Search documents" className="input" placeholder="Search documents…" /></div><select aria-label="Filter by document type" className="select" defaultValue="all"><option value="all">All types</option><option>Document</option><option>Note</option><option>Spec</option></select><select aria-label="Filter by owner" className="select" defaultValue="all"><option value="all">Anyone</option><option>Owned by me</option><option>Not owned by me</option></select><select aria-label="Sort documents" className="select" defaultValue="recent"><option value="recent">Recently updated</option><option>Name A–Z</option><option>Newest created</option></select><div className="view-toggle"><button type="button" className="active" aria-label="Grid view"><Grid2X2 size={16} /></button><button type="button" aria-label="List view"><List size={16} /></button></div></div>
    <div className="document-grid">{documents.map((doc) => <article className="doc-card" key={doc.id}><Link href={routes.document(doc.id)}><span className="doc-icon"><FileText size={18} /></span><h3>{doc.title}</h3><p>{doc.excerpt}</p><div className="doc-meta"><span>Edited {doc.updated}</span><span className="collabs">{doc.people.map((person) => <span className="avatar" key={person}>{person}</span>)}</span></div></Link><div className="doc-actions"><button type="button" aria-label="Star document"><Star size={17} /></button><button type="button" aria-label="More document options"><MoreHorizontal size={17} /></button></div></article>)}</div>
  </div>;
}
