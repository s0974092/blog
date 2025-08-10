-- 確保 '未分類' 這個預設分類存在
-- 這段 SQL 會嘗試插入一筆名為 '未分類' 的紀錄。
-- 如果 'name' 欄位因為唯一性約束 (unique constraint) 而發生衝突，
-- 代表該分類已存在，此時它會執行 UPDATE 命令，確保 is_default 欄位為 true。
-- 這完美複製了 Prisma upsert 的行為，可以安全地重複執行。

INSERT INTO public.categories (name, is_default)
VALUES ('未分類', true)
ON CONFLICT (name)
DO UPDATE SET
  is_default = EXCLUDED.is_default;
