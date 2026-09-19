import { CURRENT_USER_ID } from "@/lib/constants";
import type { DocumentSummary, DocumentType, Scope } from "@/types/document";

const people = [
  { id: "user_maya", name: "Maya Chen", email: "maya@docly.dev", color: "#8b5cf6" },
  { id: "user_noah", name: "Noah Williams", email: "noah@docly.dev", color: "#0ea5e9" },
  { id: "user_priya", name: "Priya Shah", email: "priya@docly.dev", color: "#f97316" },
  { id: "user_james", name: "James Kim", email: "james@docly.dev", color: "#10b981" },
];
const now = Date.now();
const age = (hours: number) => new Date(now - hours * 3600000).toISOString();
const seed: Array<[string, DocumentType, string, boolean, number, number, boolean]> = [
  ["Q4 product roadmap", "spec", "Alex Morgan", true, 2, 1, false], ["Design system audit", "document", "Alex Morgan", true, 5, 2, false],
  ["Team sync — September 18", "meeting", "Maya Chen", false, 24, 3, false], ["API conventions", "wiki", "Alex Morgan", false, 36, 1, false],
  ["Research: collaborative editing", "note", "Priya Shah", true, 50, 4, false], ["Customer interview notes", "meeting", "Alex Morgan", false, 72, 0, false],
  ["Mobile experience RFC", "spec", "Noah Williams", false, 100, 2, false], ["New teammate onboarding", "wiki", "Alex Morgan", true, 150, 3, false],
  ["Launch retrospective", "document", "James Kim", false, 190, 2, false], ["Content strategy 2026", "spec", "Alex Morgan", false, 240, 1, false],
  ["Very long document title to make sure truncation feels graceful across smaller layouts", "document", "Alex Morgan", false, 360, 4, false],
  ["Old architecture notes", "note", "Alex Morgan", false, 480, 0, true], ["Previous sprint planning", "meeting", "Maya Chen", false, 720, 2, true],
];
export const documents: DocumentSummary[] = seed.map(([title, type, owner, starred, hours, collaborators, trashed], index) => ({
  id: `doc_${index + 1}`, title, type, owner, ownerId: owner === "Alex Morgan" ? CURRENT_USER_ID : people[index % people.length]?.id ?? CURRENT_USER_ID,
  collaborators: people.slice(0, collaborators), isStarred: starred, visibility: collaborators ? "shared" : "private", updatedAt: age(hours), createdAt: age(hours + 200),
  lastOpenedAt: index < 7 ? age(hours / 2 + 1) : null, trashedAt: trashed ? age(hours / 3) : null,
  excerpt: ["Clear decisions, owners, and next steps for the team.", "A working document for thoughtful collaboration.", "Notes, context, and the details worth keeping."][index % 3] ?? "A working document for thoughtful collaboration.",
}));
export async function listDocuments(scope: Scope = "all") { await new Promise((r) => setTimeout(r, 120)); return documents.filter((doc) => {
  if (scope === "trash") return Boolean(doc.trashedAt);
  if (doc.trashedAt) return false;
  if (scope === "recent") return Boolean(doc.lastOpenedAt);
  if (scope === "starred") return doc.isStarred;
  if (scope === "shared") return doc.ownerId !== CURRENT_USER_ID;
  return true;
}); }
export async function getDocument(id: string) { await new Promise((r) => setTimeout(r, 180)); return documents.find((doc) => doc.id === id) ?? null; }
export async function createDocument() { await new Promise((r) => setTimeout(r, 600)); return `new_${crypto.randomUUID()}`; }
