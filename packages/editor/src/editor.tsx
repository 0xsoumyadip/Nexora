"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const initialContent = `
  <h1>Welcome to Nexora</h1>
  <p>This is a collaborative document.</p>
`;

export function DocumentEditor({ documentId }: { documentId: string }) {
  // A separate shared Yjs document for each Nexora document.
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  const editor = useEditor({
    extensions: [
      // Collaboration has its own undo/redo handling.
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({ document: ydoc }),
    ],
  });

  // Connect this Yjs document to the WebSocket room for this document.
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_YJS_URL;

    if (!url) {
      console.error("NEXT_PUBLIC_YJS_URL is not configured");
      return;
    }

    const connection = new WebsocketProvider(url, documentId, ydoc);
    setProvider(connection);

    return () => {
      connection.destroy();
      setProvider(null);
    };
  }, [documentId, ydoc]);

  // Seed initial content once, after existing shared content has loaded.
  useEffect(() => {
    if (!editor || !provider) return;

    const seedIfEmpty = (synced: boolean) => {
      if (synced && ydoc.getXmlFragment("default").length === 0) {
        editor.commands.setContent(initialContent);
      }
    };

    provider.on("sync", seedIfEmpty);

    // The initial sync might have happened before this effect attached.
    if (provider.synced) {
      seedIfEmpty(true);
    }

    return () => {
      provider.off("sync", seedIfEmpty);
    };
  }, [editor, provider, ydoc]);

  return <EditorContent editor={editor} />;
}