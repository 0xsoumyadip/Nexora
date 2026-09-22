/*
  Warnings:

  - You are about to drop the column `FullName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "FullName",
ADD COLUMN     "name" TEXT;
