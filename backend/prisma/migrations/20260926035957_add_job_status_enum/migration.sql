/*
  Warnings:

  - The `status` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('Draft', 'Open', 'Closed');

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "status",
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'Draft';
