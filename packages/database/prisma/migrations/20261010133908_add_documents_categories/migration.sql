-- DropIndex
DROP INDEX "Document_authorId_idx";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "lastOpenedAt" TIMESTAMP(3),
ADD COLUMN     "trashed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trashedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Document_authorId_trashed_idx" ON "Document"("authorId", "trashed");

-- CreateIndex
CREATE INDEX "Document_authorId_starred_idx" ON "Document"("authorId", "starred");

-- CreateIndex
CREATE INDEX "Document_authorId_lastOpenedAt_idx" ON "Document"("authorId", "lastOpenedAt");
