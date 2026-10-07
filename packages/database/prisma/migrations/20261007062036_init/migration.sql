/*
  Warnings:

  - You are about to drop the column `public_id` on the `Document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleDriveFileId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googleDriveFileId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "public_id",
ADD COLUMN     "googleDriveFileId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "url" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Document_googleDriveFileId_key" ON "Document"("googleDriveFileId");

-- CreateIndex
CREATE INDEX "Document_authorId_idx" ON "Document"("authorId");
