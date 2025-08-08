/*
  Warnings:

  - You are about to drop the column `is_test` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `is_test` on the `post_tags` table. All the data in the column will be lost.
  - You are about to drop the column `is_test` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `is_test` on the `subcategories` table. All the data in the column will be lost.
  - You are about to drop the column `is_test` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_post_id_fkey";

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "is_test";

-- AlterTable
ALTER TABLE "public"."post_tags" DROP COLUMN "is_test";

-- AlterTable
ALTER TABLE "public"."posts" DROP COLUMN "is_test";

-- AlterTable
ALTER TABLE "public"."subcategories" DROP COLUMN "is_test";

-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "is_test";

-- DropTable
DROP TABLE "public"."comments";
