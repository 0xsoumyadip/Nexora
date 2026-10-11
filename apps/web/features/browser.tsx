"use client";

import Link from "next/link";
import {
  FileText,
  Grid2X2,
  List,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { routes } from "@/lib/constants";
import { useEffect, useState } from "react";
import { deleteAllDocumentPeremanently, deleteDocumentPermanently, getAllDocuments, starDocument, trashDocument } from "@/lib/auth";
import { useSession } from "@nexora/auth/client";
import { useRouter } from "next/navigation";

const copy = {
  all: ["My files", "All your documents, in one calm place."],
  recent: ["Recent", "Documents you open will appear here."],
  starred: ["Starred", "Your most important work, close at hand."],
  shared: ["Shared with me", "Work your teammates have shared with you."],
  trash: ["Trash", "Items in trash are deleted after 30 days."],
} as const;

type DocumentProps = {
  id: string;
  name: string | null;
  title: string | null;
  author?: string | null;
  updated?: string | null;
  trashed: boolean | null;
  starred: boolean | null;
  people?: string[];
};

export function DocumentBrowser({
  scope = "all",
  dashboard = false,
  userName
}: {
  scope?: keyof typeof copy;
  dashboard?: boolean;
  userName?: string;
}) {

  const { data: session } = useSession();
  const [title, description] = copy[scope];
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentProps[]>([]);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const currentUserId = session?.user.id;

  useEffect(() => {
    let active = true;

    async function getDocuments() {
      try {
        const response = await getAllDocuments();

        const activeDocuments = response.documents.filter((document) => !document.trashed);
        const starredDocuments = response.documents.filter((document) => document.starred);
        const trashedDocuments = response.documents.filter((document) => document.trashed);
        const recentDocuments = response.documents.filter((document) => document.lastOpenedAt)
          .sort((a, b) =>
            new Date(b.lastOpenedAt!).getTime() -
            new Date(a.lastOpenedAt!).getTime())
          .slice(0, 20)
        const sharedWithMe = response.documents.filter((document) => document.authorId !== currentUserId && document.members.length > 0);

        if (active) {
          if (scope === "recent") {
            setDocuments(recentDocuments);
          } else if (scope === "starred") {
            setDocuments(starredDocuments);
          } else if (scope === "trash") {
            setDocuments(trashedDocuments);
          } else if (scope === "shared") {
            setDocuments(sharedWithMe);
          } else {
            setDocuments(activeDocuments);
          }
          setDocumentsError(null);
        }
      } catch (error) {
        console.error("Unable to load documents:", error);
        if (active) {
          setDocumentsError("Could not load documents. Check your connection and try again.");
        }
      }
    }

    getDocuments();

    return () => {
      active = false;
    };
  }, []);

  async function handleStarDocument(documentId: string) {
    try {
      await starDocument(documentId);
      router.refresh();
    } catch (error) {
      console.error("Starred document error: ", error);
    }
  }

  async function handleTrashDocument(documentId: string) {
    console.log("button clicked.")
    try {
      await trashDocument(documentId);
      window.location.reload();
    } catch (error) {
      console.error("Trash document error: ", error);
    }
  }

  async function handleDeleteDocument(documentId: string) {
    try {
      await deleteDocumentPermanently(documentId);
      window.location.reload();
    } catch (error) {
      console.log("Delete document error: ", error);
    }
  }

  async function handleDeleteAllDocuments() {
    try {
      await deleteAllDocumentPeremanently();
      window.location.reload();
    } catch (error) {
      console.log("Delete all files error: ", error);
    }
  }

  return (
    <div className={`app-content${scope === "trash" ? " trash-page" : ""}`}>
      <div className="page-title">
        <div>
          <h1>{dashboard ? `Good Morning, ${userName}` : title}</h1>
          <p>
            {dashboard
              ? "You have 4 documents · 3 shared with you"
              : description}
          </p>
        </div>
        <Link className="btn" href={routes.newDocument}>
          <FileText size={16} />
          New file
        </Link>
      </div>
      {documentsError && <p role="alert" className="form-alert">{documentsError}</p>}
      {dashboard && (
        <>
          <div className="recent-head">
            <h2 style={{ fontSize: 17 }}>Recent documents</h2>
            <Link className="muted" href="/recent">
              View all
            </Link>
          </div>
          <div className="recent-strip">
            {documents.slice(0, 4).map((doc) => (
              <Link
                className="recent-card"
                key={doc.id}
                href={routes.document(doc.id)}
              >
                <span className="doc-icon">
                  <FileText size={17} />
                </span>
                <h3>{doc.name}</h3>
                <small className="muted">Edited {doc.updated}</small>
              </Link>
            ))}
          </div>
        </>
      )}
      {scope === "trash" && (
        <div className="trash-note">
          <span className="trash-note-icon"><Trash2 size={17} /></span>
          <span>
            <strong>Items in trash</strong>
            <small>Deleted items are permanently removed after 30 days.</small>
          </span>
        </div>
      )}
      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input
            aria-label="Search documents"
            className="input"
            placeholder="Search documents…"
          />
        </div>

        <select aria-label="Filter by owner" className="select" defaultValue="all">
          <option value="all">Anyone</option>
          <option value="owned">Owned by me</option>
          <option value="not-owned">Not owned by me</option>
        </select>

        <select aria-label="Sort documents" className="select" defaultValue="recent">
          <option value="recent">Recently updated</option>
          <option value="name">Name A–Z</option>
          <option value="created">Newest created</option>
        </select>

        <div className="view-toggle">
          <button type="button" className="active" aria-label="Grid view">
            <Grid2X2 size={16} />
          </button>
          <button type="button" aria-label="List view">
            <List size={16} />
          </button>
        </div>

        {scope === "trash" && (
          <button type="button" onClick={handleDeleteAllDocuments} className="trash-button" aria-label="Trash">
            <span className="trash-button-icon"><Trash2 size={16} /></span>
            <span>Trash</span>
          </button>
        )}
      </div>
      <div className={`document-grid${scope === "trash" ? " trash-document-grid" : ""}`}>
        {documents.map((doc) => (
          <article className={`doc-card${scope === "trash" ? " trash-doc-card" : ""}`} key={doc.id}>
            <Link href={routes.document(doc.id)}>
              <span className="doc-icon">
                <FileText size={18} />
              </span>
              <h3>{doc.name}</h3>
              <div className="doc-meta">
                <span>Edited {doc.updated}</span>
                <span className="collabs">
                  {(doc.people ?? []).map((person) => (
                    <span className="avatar" key={person}>
                      {person}
                    </span>
                  ))}
                </span>
              </div>
            </Link>
            <div className="doc-actions">
              {doc.starred ? (
              <button type="button" onClick={() => handleStarDocument(doc.id)} aria-label="Star document">
                ⭐
              </button>
              ) : (
              <button type="button" onClick={() => handleStarDocument(doc.id)} aria-label="Star document">
                <Star size={17} />
              </button>
              )}
              {doc.trashed ? (
              <button type="button" onClick={() => handleDeleteDocument(doc.id)} aria-label="Delete document permanently">
                <Trash2 size={17} />
              </button>
              ) : (
              <button type="button" onClick={() => handleTrashDocument(doc.id)} aria-label="Move document to trash">
                <Trash2 size={17} />
              </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {scope === "trash" && documents.length === 0 && !documentsError && (
        <div className="trash-empty">
          <span className="trash-empty-icon"><Trash2 size={22} /></span>
          <h2>Your trash is empty</h2>
          <p>Documents you move to trash will appear here.</p>
        </div>
      )}
    </div>
  );
}
