export type DocumentType = "document" | "note" | "spec" | "meeting" | "wiki";
export type Scope = "all" | "recent" | "starred" | "shared" | "trash";
export interface Collaborator { id: string; name: string; email: string; color: string; }
export interface DocumentSummary {
  id: string; title: string; type: DocumentType; owner: string; ownerId: string; collaborators: Collaborator[];
  isStarred: boolean; visibility: "private" | "shared" | "workspace"; updatedAt: string; createdAt: string;
  lastOpenedAt: string | null; trashedAt: string | null; excerpt: string;
}
