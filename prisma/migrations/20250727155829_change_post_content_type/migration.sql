/*
  Warnings:

  - The `content` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "content",
ADD COLUMN     "content" JSONB;
