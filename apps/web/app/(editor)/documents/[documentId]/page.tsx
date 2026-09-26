import { DocumentPage } from "@/features/document-editor";
export default async function Page({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return <DocumentPage documentId={documentId} />;
}
