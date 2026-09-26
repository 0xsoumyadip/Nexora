"use client";

import { DocumentEditor } from "@nexora/editor";

export function DocumentPage({ documentId }: { documentId: string }) {
  return <DocumentEditor documentId={documentId} />;
}
