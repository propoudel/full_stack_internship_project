/*
  Warnings:

  - You are about to drop the column `coverLetter` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "coverLetter",
ADD COLUMN     "Experience" TEXT;
