"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import {
  ArrowLeft, Bold, ChevronDown, Code2, Heading1, Heading2,
  Italic, List, ListOrdered, LoaderCircle, MoreHorizontal,
  Redo2, Strikethrough, Undo2, Quote, Minus,
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
            {menuOpen && <div className="editor-menu"><button type="button" onClick={() => { void navigator.clipboard.writeText(window.location.href); setMenuOpen(false); }}>Copy document link</button><button type="button" onClick={() => window.print()}>Print document</button></div>}
          </div>
        </div>
      </header>

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
        <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List {...icons} /></ToolButton>
        <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered {...icons} /></ToolButton>
        <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote {...icons} /></ToolButton>
        <ToolButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 {...icons} /></ToolButton>
        <ToolButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus {...icons} /></ToolButton>
        <span className="editor-toolbar-spacer" />
        <span className="editor-toolbar-live"><i />{connection === "connected" ? "Live" : "Offline"}</span>
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
