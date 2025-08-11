-- 以下是根據「所有登入使用者都可以建立與管理自己的資料」這個原則，重新設計的 RLS 策略。
-- 修訂後的 RLS 策略 (無角色區分)

-- 為 Prisma 遷移紀錄表啟用 RLS (Row-Level Security)
-- 透過啟用 RLS 但不設定任何允許策略 (POLICY)，我們預設會阻擋所有來自應用程式 API 的存取 (例如 anon 和 authenticated 角色)。
-- 這是一項重要的安全措施，可以防止應用程式本身意外讀寫或竄改資料庫的遷移歷史紀錄。
-- 只有資料庫的擁有者或高權限角色 (例如在本機端執行 `prisma migrate` 時所用的角色) 才能繞過此限制來存取此資料表。
-- 啟用 RLS
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

-- 1. posts (文章)

-- 目標：
--  * 任何人都可以讀取已發布的文章。
--  * 使用者可以讀取自己所有的文章 (包含草稿)。
--  * 登入的使用者可以建立文章。
--  * 使用者只能更新或刪除自己的文章。

-- 重新設定 posts 資料表的 RLS
-- 首先移除舊的 Policy (如果已存在)
DROP POLICY IF EXISTS "Allow public read access to published posts" ON public.posts;
DROP POLICY IF EXISTS "Allow author and admin to read all posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON public.posts;
DROP POLICY IF EXISTS "Allow author and admin to update posts" ON public.posts;
DROP POLICY IF EXISTS "Allow author and admin to delete posts" ON public.posts;

-- 啟用 RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 建立 SELECT 策略
CREATE POLICY "Allow public read access to published posts"
ON public.posts
FOR SELECT
USING (published = true);

CREATE POLICY "Allow author to read their own posts"
ON public.posts
FOR SELECT
USING (auth.uid() = posts.author_id);

-- 建立 INSERT 策略
CREATE POLICY "Allow authenticated users to create posts"
ON public.posts
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 建立 UPDATE 策略
CREATE POLICY "Allow author to update their own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = posts.author_id);

-- 建立 DELETE 策略
CREATE POLICY "Allow author to delete their own posts"
ON public.posts
FOR DELETE
USING (auth.uid() = posts.author_id);

-- 重要：在您的應用程式中，當使用者建立文章時，您必須將 posts.author_id 欄位的值設定為當前登入使用者的 ID，即
-- auth.uid()。RLS 策略依賴此欄位來判斷擁有者。

-- 2. categories, subcategories, tags (分類、子分類、標籤)

-- 目標：
--  * 任何人都可以讀取。
--  * 任何登入的使用者都可以建立、更新和刪除。 (這使得這些資源由社群共同管理)

-- Categories
DROP POLICY IF EXISTS "Allow public read access to all categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin to manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON public.categories;

-- 啟用 RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to all categories" ON public.categories FOR SELECT
  USING (true);
CREATE POLICY "Allow authenticated users to manage categories" ON public.categories FOR ALL
USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Subcategories
DROP POLICY IF EXISTS "Allow public read access to all subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Allow admin to manage subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Allow authenticated users to manage subcategories" ON
  public.subcategories;

-- 啟用 RLS
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to all subcategories" ON public.subcategories FOR
  SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage subcategories" ON public.subcategories FOR
  ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Tags
DROP POLICY IF EXISTS "Allow public read access to all tags" ON public.tags;
DROP POLICY IF EXISTS "Allow admin to manage tags" ON public.tags;
DROP POLICY IF EXISTS "Allow authenticated users to manage tags" ON public.tags;

-- 啟用 RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to all tags" ON public.tags FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage tags" ON public.tags FOR ALL USING
  (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3. post_tags (文章與標籤的關聯)
-- 目標：
--  * 任何人都可以讀取。
--  * 只有對應文章的作者可以管理 (新增、刪除) 標籤關聯。
DROP POLICY IF EXISTS "Allow public read access to all post_tags" ON public.post_tags;
DROP POLICY IF EXISTS "Allow author and admin to manage post_tags" ON public.post_tags;
DROP POLICY IF EXISTS "Allow author to manage post_tags" ON public.post_tags;

-- 啟用 RLS
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to all post_tags"
ON public.post_tags
FOR SELECT
USING (true);

CREATE POLICY "Allow author to manage post_tags"
ON public.post_tags
FOR ALL
USING (auth.uid() = (SELECT posts.author_id FROM public.posts WHERE id = post_tags.post_id))
WITH CHECK (auth.uid() = (SELECT posts.author_id FROM public.posts WHERE id = post_tags.post_id));