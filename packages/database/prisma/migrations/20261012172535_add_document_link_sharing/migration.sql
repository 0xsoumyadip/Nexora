-- AlterTable
ALTER TABLE "DocumentMember" ADD COLUMN     "isLinkShareEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkShareRole" "DocumentRole" NOT NULL DEFAULT 'VIEWER',
ADD COLUMN     "shareTokens" TEXT;
