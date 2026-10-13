"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import {
  ArrowLeft, Bold, ChevronDown, Code2, Heading1, Heading2,
  Italic, List, ListOrdered, LoaderCircle, MoreHorizontal,
  Redo2, Strikethrough, Undo2, Quote, Minus, Eye, Link2, Pencil, X,
} from "lucide-react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

type DocumentInfo = { id: string; name: string | null };
type ConnectionState = "connecting" | "connected" | "offline";

const icons = { size: 16, strokeWidth: 1.8 };

function ToolButton({
  label, active, disabled, onClick, children,
}: {
  label: string; active?: boolean; disabled?: boolean;
  onClick: () => void; children: ReactNode;
}) {
  return <button className={`editor-tool${active ? " is-active" : ""}`} type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick}>{children}</button>;
}

export function DocumentEditor({ documentId }: { documentId: string }) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [document, setDocument] = useState<DocumentInfo>({ id: documentId, name: "Untitled Document" });
  const [titleDraft, setTitleDraft] = useState("Untitled Document");
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareRole, setShareRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [shareUrl, setShareUrl] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareCopyError, setShareCopyError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit.configure({ undoRedo: false }), Collaboration.configure({ document: ydoc })],
    editorProps: {
      attributes: {
        class: "doc-prose",
        "aria-label": "Document content",
        spellcheck: "true",
      },
    },
  });

  useEffect(() => {
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/document/${encodeURIComponent(documentId)}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Document could not be loaded");
        return response.json() as Promise<{ document: { id: string; name?: string | null } }>;
      })
      .then(({ document: loaded }) => {
        if (!cancelled) {
          const loadedDocument = {
            ...loaded,
            name: loaded.name || "Untitled Document",
          };
          setDocument(loadedDocument);
          setTitleDraft(loadedDocument.name);
        }
      })
      .catch(() => setLoadError(true));
    return () => { cancelled = true; };
  }, [documentId]);

  useEffect(() => {
    const configuredUrl = process.env.NEXT_PUBLIC_YJS_URL;
    if (!configuredUrl) {
      setConnection("offline");
      return;
    }

    const url = new URL(configuredUrl);
    if (url.protocol === "https:") url.protocol = "wss:";
    if (url.protocol === "http:") url.protocol = "ws:";
    const nextProvider = new WebsocketProvider(url.toString(), documentId, ydoc);
    setProvider(nextProvider);
    const onStatus = ({ status }: { status: string }) => setConnection(status === "connected" ? "connected" : "offline");
    nextProvider.on("status", onStatus);
    return () => {
      nextProvider.off("status", onStatus);
      nextProvider.destroy();
      setProvider(null);
    };
  }, [documentId, ydoc]);

  useEffect(() => {
    if (!shareLinkCopied) return;

    const timeoutId = window.setTimeout(() => setShareLinkCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [shareLinkCopied]);

  const saveTitle = useCallback(async () => {
    const nextName = titleDraft.trim() || "Untitled Document";
    setTitleDraft(nextName);
    if (nextName === document.name) return;
    setTitleSaving(true);
    setTitleError(false);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/document/${encodeURIComponent(documentId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      if (!response.ok) throw new Error("Could not save title");
      const result = await response.json() as { document: { id: string; name?: string | null } };
      setDocument({ id: result.document.id, name: result.document.name || "Untitled Document" });
    } catch {
      setTitleError(true);
      setTitleDraft(document.name || "Untitled Document");
    } finally {
      setTitleSaving(false);
    }
  }, [document.name, documentId, titleDraft]);

  if (loadError) return <div className="editor-loading editor-load-error"><div><h1>Document unavailable</h1><p>This document may have been moved or you may not have access.</p><a className="editor-back-link" href="/documents">Back to documents</a></div></div>;
  if (!editor) return <div className="editor-loading"><LoaderCircle className="spin" /> Opening your document…</div>;

  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();
  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;
  const statusLabel = connection === "connected" ? "All changes synced" : connection === "offline" ? "Reconnecting…" : "Connecting…";

  async function createShareLink() {
    setShareLoading(true);
    setShareError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("Ther API url is not set.");
      }

      const response = await fetch(`${apiUrl}/api/document/${encodeURIComponent(documentId)}/share`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: shareRole })
      });

      const result = (await response.json().catch(() => null)) as {
        shareUrl?: unknown;
        message?: unknown;
      } | null;

      if (!response.ok) {
        throw new Error(
          typeof result?.message === "string" ? result.message : "Could not create share link."
        );
      }

      if (typeof result?.shareUrl !== "string") {
        throw new Error("The API did not return a share link.");
      }

      setShareUrl(result.shareUrl);
      setShareLinkCopied(false);
      setShareCopyError(null);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "Could not create the share link"
      );
    } finally {
      setShareLoading(false);
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareLinkCopied(true);
      setShareCopyError(null);
    } catch (error) {
      console.error("Copy share link error:", error);
      setShareLinkCopied(false);
      setShareCopyError("Could not copy the link. Please copy it from the field.");
    }
  }

  return (
    <main className="editor-workspace">
      <header className="editor-topbar">
        <a className="editor-back" href="/documents" aria-label="Back to documents"><ArrowLeft {...icons} /><span>Documents</span></a>
        <span className="editor-brand-mark" aria-hidden="true">N</span>
        <div className="editor-title-wrap">
          <input className="editor-title" aria-label="Document title" maxLength={120} value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} onBlur={saveTitle} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
          <span className={`editor-save-status${titleError ? " has-error" : ""}`}><i />{titleSaving ? "Saving title…" : titleError ? "Title could not be saved" : statusLabel}</span>
        </div>
        <div className="editor-top-actions">
          <div className="editor-menu-wrap">
            <button className="editor-square" aria-label="More document actions" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal {...icons} /></button>
            {menuOpen && <div className="editor-menu">
              <button type="button" onClick={() => { setMenuOpen(false); setShareDialogOpen(true) }}>Share Document</button>
              <button type="button" onClick={() => window.print()}>Print document</button>
            </div>}
          </div>
        </div>
      </header>
      {shareDialogOpen && (
        <div
          className="share-dialog-backdrop"
          onClick={() => setShareDialogOpen(false)}
        >
          <section
            className="share-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            aria-describedby="share-description"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="share-dialog-header">
              <div className="share-dialog-heading">
                <span className="share-dialog-icon" aria-hidden="true">
                  <Link2 size={18} />
                </span>
                <div>
                  <h2 id="share-title">Share document</h2>
                  <p id="share-description">
                    Choose what people with the link are allowed to do.
                  </p>
                </div>
              </div>
              <button
                className="share-dialog-close"
                type="button"
                aria-label="Close share dialog"
                onClick={() => setShareDialogOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <fieldset className="share-role-options">
              <legend>Anyone with the link can</legend>
              <label className={`share-role-option${shareRole === "VIEWER" ? " is-selected" : ""}`}>
                <input
                  type="radio"
                  name="share-role"
                  value="VIEWER"
                  checked={shareRole === "VIEWER"}
                  onChange={() => setShareRole("VIEWER")}
                />
                <span className="share-role-icon" aria-hidden="true">
                  <Eye size={18} />
                </span>
                <span className="share-role-copy">
                  <strong>Viewer</strong>
                  <span>Can read this document, but not make changes.</span>
                </span>
                <span className="share-role-indicator" aria-hidden="true" />
              </label>
              <label className={`share-role-option${shareRole === "EDITOR" ? " is-selected" : ""}`}>
                <input
                  type="radio"
                  name="share-role"
                  value="EDITOR"
                  checked={shareRole === "EDITOR"}
                  onChange={() => setShareRole("EDITOR")}
                />
                <span className="share-role-icon" aria-hidden="true">
                  <Pencil size={18} />
                </span>
                <span className="share-role-copy">
                  <strong>Editor</strong>
                  <span>Can make changes and collaborate with you.</span>
                </span>
                <span className="share-role-indicator" aria-hidden="true" />
              </label>
            </fieldset>

            {shareUrl && (
              <div className="share-link-result">
                <input aria-label="Share link" readOnly value={shareUrl} />
                <button
                  className={`share-copy-button${shareLinkCopied ? " is-copied" : ""}`}
                  type="button"
                  onClick={() => void copyShareLink()}
                  aria-live="polite"
                >
                  {shareLinkCopied ? "Copied!" : "Copy link"}
                </button>
              </div>
            )}
            {shareCopyError && <p className="share-copy-error" role="alert">{shareCopyError}</p>}

            <footer className="share-dialog-footer">
              <button
                className="share-dialog-cancel"
                type="button"
                onClick={() => setShareDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="share-dialog-submit"
                type="button"
                onClick={createShareLink}
                disabled={shareLoading}
              >
                {shareLoading ? "Creating Link" : "Create link"}
              </button>
              {shareError && <p className="form-alert" role="alert">{shareError}</p>}
            </footer>
          </section>
        </div>
      )}

      <nav className="editor-menubar" aria-label="Document tools">
        <button className="editor-view-toggle" type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!canUndo} aria-label="Undo"><Undo2 {...icons} /></button>
        <button className="editor-view-toggle" type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!canRedo} aria-label="Redo"><Redo2 {...icons} /></button>
        <span className="editor-shortcut-hint">Undo&nbsp; Ctrl Z &nbsp;·&nbsp; Redo&nbsp; Ctrl Shift Z</span>
        <span className="editor-menu-divider" />
        <button className="editor-view-toggle" type="button" onClick={() => window.print()}>Print</button>
      </nav>

      <nav className="editor-toolbar" aria-label="Text formatting">
        <select className="editor-style-select" aria-label="Text style" value={editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : "p"} onChange={(event) => {
          const chain = editor.chain().focus();
          if (event.target.value === "h1") chain.toggleHeading({ level: 1 }).run();
          else if (event.target.value === "h2") chain.toggleHeading({ level: 2 }).run();
          else chain.setParagraph().run();
        }}><option value="p">Normal text</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option></select>
        <span className="editor-tool-divider" />
        <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold {...icons} /></ToolButton>
        <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic {...icons} /></ToolButton>
        <ToolButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough {...icons} /></ToolButton>
        <span className="editor-tool-divider" />
        <ToolButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 {...icons} /></ToolButton>
        <ToolButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 {...icons} /></ToolButton>
        <span className="editor-tool-divider" />
        <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List {...icons} />
        </ToolButton>
        <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered {...icons} />
        </ToolButton>
        <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote {...icons} /></ToolButton>
        <ToolButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 {...icons} /></ToolButton>
        <ToolButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus {...icons} />
        </ToolButton>
        <span className="editor-toolbar-spacer" />
        <span className="editor-toolbar-live">
          <i />{connection === "connected" ? "Live" : "Offline"}
        </span>
      </nav>

      <section className="editor-canvas" onClick={() => setMenuOpen(false)}>
        <article className="editor-page">
          <EditorContent editor={editor} />
        </article>
      </section>
      <footer className="editor-footer"><span>Page 1 of 1</span><span>{wordCount} words &nbsp;·&nbsp; {provider ? "Collaborative editing" : "Offline editing"}</span><span>100%</span></footer>
    </main>
  );
}
