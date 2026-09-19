import { notFound } from "next/navigation";
import { Editor } from "@/features/editor";
import { getDocument } from "@/lib/data/documents";

export default async function Page({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  const document = await getDocument(documentId);
  if (!document && !documentId.startsWith("new_")) notFound();
  return <Editor document={document} />;
}
