-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "author_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_id" INTEGER NOT NULL DEFAULT 1,
    "subcategory_id" INTEGER,
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,
    "published" BOOLEAN DEFAULT false,
    "cover_image_url" TEXT,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "post_id" UUID NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
