"use client";

import { openDocumet } from "@/lib/auth";
import { DocumentEditor } from "@nexora/editor";
import { useEffect } from "react";

export function DocumentPage({ documentId }: { documentId: string }) {

  useEffect(() => {
    async function updateDocument() {
      try {
        await openDocumet(documentId);
      } catch (error) {
        console.error("Failed to update the recent document: ", error);
      }
    }

    updateDocument();
  },[documentId])

  return <DocumentEditor documentId={documentId} />;
}
