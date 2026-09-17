-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'User';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'User';
