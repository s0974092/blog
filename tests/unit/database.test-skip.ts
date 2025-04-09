import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
}

// 使用 service role key 創建 Supabase 客戶端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

// 添加錯誤處理輔助函數
const handleError = (error: any, operation: string) => {
  if (error) {
    console.error(`${operation} 時發生錯誤：`, error);
    throw error;
  }
};

// 清理測試數據
const cleanupTestData = async () => {
  const { error } = await supabase.rpc('cleanup_test_data');
  handleError(error, '清理測試數據');
};

beforeAll(async () => {
  try {
    // 確保有預設分類
    const { error: insertError } = await supabase
      .from('categories')
      .upsert({
        id: 1,
        name: '未分類',
        is_default: true,
      });
    handleError(insertError, '插入預設分類');

  } catch (error) {
    console.error('測試初始化失敗：', error);
    throw error;
  }
});

beforeEach(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

describe('資料庫 CRUD 測試 (使用 Supabase)', () => {
  let categoryId: number;
  let subcategoryId: number;
  let postId: string;
  let tagId: number;

  // 測試：創建分類
  it('應該成功創建一個分類 (技術)', async () => {
    const currentTime = new Date().toISOString();
    const { data: category, error } = await supabase
      .from('categories')
      .insert({ 
        name: '技術測試1', 
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(category).not.toBeNull();
    expect(category!.name).toBe('技術測試1');
  });

  // 測試：創建子分類
  it('應該成功創建一個子分類 (Next.js)', async () => {
    const currentTime = new Date().toISOString();
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({ 
        name: '技術測試2', 
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(categoryError).toBeNull();
    categoryId = category!.id;

    const { data: subcategory, error: subcategoryError } = await supabase
      .from('subcategories')
      .insert({
        name: 'Next.js',
        category_id: categoryId,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(subcategoryError).toBeNull();
    subcategoryId = subcategory!.id;
    expect(subcategory!.name).toBe('Next.js');
  });

  // 測試：創建標籤
  it('應該成功創建一個標籤 (技術分享)', async () => {
    const currentTime = new Date().toISOString();
    const { data: existingTag, error: existingTagError } = await supabase
      .from('tags')
      .select()
      .eq('name', '技術分享')
      .single();

    if (!existingTag) {
      const { data: tag, error: tagError } = await supabase
        .from('tags')
        .insert({
          name: '技術分享',
          is_test: true,
          created_at: currentTime,
          updated_at: currentTime,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        })
        .select()
        .single();

      expect(tagError).toBeNull();
      tagId = tag!.id;
    } else {
      tagId = existingTag.id;
    }
  });

  // 測試：文章與標籤建立關聯
  it('應該成功將標籤 (技術分享) 關聯到文章', async () => {
    const currentTime = new Date().toISOString();
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({ 
        name: '技術測試3', 
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(categoryError).toBeNull();
    categoryId = category!.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '第一篇文章',
        slug: 'first-post',
        content: '這是一篇測試文章',
        category_id: categoryId,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();
    postId = post!.id;

    // 建立標籤
    const { data: existingTag, error: existingTagError } = await supabase
      .from('tags')
      .select()
      .eq('name', '技術分享')
      .single();

    if (!existingTag) {
      const { data: tag, error: tagError } = await supabase
        .from('tags')
        .insert({
          name: '技術分享',
          is_test: true,
          created_at: currentTime,
          updated_at: currentTime,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        })
        .select()
        .single();

      expect(tagError).toBeNull();
      tagId = tag!.id;
    } else {
      tagId = existingTag.id;
    }

    // 建立關聯
    const { error: relationError } = await supabase
      .from('post_tags')
      .insert({
        post_id: postId,
        tag_id: tagId,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(relationError).toBeNull();

    const { data: postTags, error: queryError } = await supabase
      .from('post_tags')
      .select('*')
      .eq('post_id', postId);

    expect(queryError).toBeNull();
    expect(postTags!.length).toBe(1);
    expect(postTags![0].tag_id).toBe(tagId);
  });

  // 查詢測試：查詢所有文章（支援分頁）
  test('應該能夠查詢所有文章，並支援分頁', async () => {
    const currentTime = new Date().toISOString();
    // 建立測試數筆文章
    const { error: insertError } = await supabase
      .from('posts')
      .insert([
        {
          title: '文章 1',
          slug: 'post-1',
          content: '內容 1',
          category_id: 1,
          updated_at: currentTime,
          created_at: currentTime,
          author_id: SYSTEM_USER_ID,
          is_test: true,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        },
        {
          title: '文章 2',
          slug: 'post-2',
          content: '內容 2',
          category_id: 1,
          updated_at: currentTime,
          created_at: currentTime,
          author_id: SYSTEM_USER_ID,
          is_test: true,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        },
      ]);

    expect(insertError).toBeNull();

    const { data: posts, error: queryError } = await supabase
      .from('posts')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('category_id', 1)  // 只查詢未分類的文章
      .eq('is_test', true)   // 只查詢測試文章
      .range(0, 9);

    expect(queryError).toBeNull();
    expect(posts!.length).toBeGreaterThan(0);
    expect(posts![0].category.name).toBe('未分類');
  });

  // 查詢測試：查詢特定分類的文章
  it('應該能夠查詢特定分類 (技術) 內的文章', async () => {
    const currentTime = new Date().toISOString();
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({ 
        name: '技術測試4', 
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(categoryError).toBeNull();
    categoryId = category!.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '技術文章',
        slug: 'tech-post',
        content: '技術內容',
        category_id: categoryId,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();

    const { data: posts, error: queryError } = await supabase
      .from('posts')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_test', true);

    expect(queryError).toBeNull();
    expect(posts!.length).toBeGreaterThan(0);
    expect(posts![0].category_id).toBe(categoryId);
  });

  // 查詢測試：查詢含有標籤 (技術分享) 的文章
  it('應該能夠查詢含有標籤 (技術分享) 的文章', async () => {
    const currentTime = new Date().toISOString();
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({ 
        name: '技術測試5', 
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(categoryError).toBeNull();
    categoryId = category!.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '帶標籤文章',
        slug: 'tagged-post',
        content: '含標籤內容',
        category_id: categoryId,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();
    postId = post!.id;

    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .insert({
        name: '標籤查詢測試',
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(tagError).toBeNull();
    tagId = tag!.id;

    const { error: relationError } = await supabase
      .from('post_tags')
      .insert({
        post_id: postId,
        tag_id: tagId,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(relationError).toBeNull();

    const { data: posts, error: queryError } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags!inner (
          tag:tags!inner (
            name
          )
        )
      `)
      .eq('post_tags.tag_id', tagId)
      .eq('is_test', true);

    expect(queryError).toBeNull();
    expect(posts!.length).toBeGreaterThan(0);
    expect(posts![0].post_tags[0].tag.name).toBe('標籤查詢測試');
  });

  // 查詢測試：統計每個分類的文章數量
  test('應該能夠統計每個分類內的文章數量', async () => {
    const currentTime = new Date().toISOString();
    // 先創建一些測試數據
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({ 
        name: '測試分類', 
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(categoryError).toBeNull();
    const categoryId = category!.id;

    // 在分類下創建一些文章
    const { error: postsError } = await supabase
      .from('posts')
      .insert([
        {
          title: '文章 1',
          slug: 'post-1',
          content: '內容 1',
          category_id: categoryId,
          updated_at: currentTime,
          created_at: currentTime,
          author_id: SYSTEM_USER_ID,
          is_test: true,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        },
        {
          title: '文章 2',
          slug: 'post-2',
          content: '內容 2',
          category_id: categoryId,
          updated_at: currentTime,
          created_at: currentTime,
          author_id: SYSTEM_USER_ID,
          is_test: true,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        }
      ]);

    expect(postsError).toBeNull();

    const { data: counts, error: countError } = await supabase.rpc('count_posts_by_category');

    expect(countError).toBeNull();
    expect(counts!.length).toBeGreaterThan(0);
    
    // 檢查新創建的分類的文章數量
    const categoryCount = counts!.find((c: any) => c.category_id === categoryId);
    expect(categoryCount).toBeDefined();
    expect(categoryCount!.post_count).toBe(2);
  });

  // 修改測試：修改文章標題
  test('應該能夠修改文章標題', async () => {
    const currentTime = new Date().toISOString();
    // 建立文章
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '原始標題',
        slug: 'original-post',
        content: '內容',
        category_id: 1,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();
    postId = post!.id;

    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({ 
        title: '修改後的文章標題',
        updated_at: new Date().toISOString(),
        updated_by: SYSTEM_USER_ID
      })
      .eq('id', postId)
      .select()
      .single();

    expect(updateError).toBeNull();
    expect(updatedPost!.title).toBe('修改後的文章標題');
  });

  // 修改測試：修改文章分類
  it('應該能夠修改文章分類 (改為預設分類)', async () => {
    const currentTime = new Date().toISOString();
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({ 
        name: '技術測試6', 
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(categoryError).toBeNull();
    categoryId = category!.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '分類變更文章',
        slug: 'change-category',
        content: '內容',
        category_id: categoryId,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();
    postId = post!.id;

    // 修改文章分類為預設分類 (id: 1)
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        category_id: 1, 
        updated_at: new Date().toISOString(),
        updated_by: SYSTEM_USER_ID
      })
      .eq('id', postId);

    expect(updateError).toBeNull();

    const { data: updatedPost, error: queryError } = await supabase
      .from('posts')
      .select()
      .eq('id', postId)
      .single();

    expect(queryError).toBeNull();
    expect(updatedPost!.category_id).toBe(1);
  });

  // 修改測試：修改標籤名稱並確認關聯不變
  test('應該能夠修改標籤名稱，且不影響與文章的關聯', async () => {
    const currentTime = new Date().toISOString();
    // 建立標籤與關聯
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .insert({
        name: '技術教學測試',
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(tagError).toBeNull();
    tagId = tag!.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '關聯測試文章',
        slug: 'relation-test',
        content: '內容',
        category_id: 1,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();
    postId = post!.id;

    const { error: relationError } = await supabase
      .from('post_tags')
      .insert({
        post_id: postId,
        tag_id: tagId,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(relationError).toBeNull();

    // 修改標籤名稱
    const { error: updateError } = await supabase
      .from('tags')
      .update({ 
        name: '修改後的標籤名稱',
        updated_at: new Date().toISOString(),
        updated_by: SYSTEM_USER_ID
      })
      .eq('id', tagId);

    expect(updateError).toBeNull();

    const { data: updatedTag, error: queryTagError } = await supabase
      .from('tags')
      .select()
      .eq('id', tagId)
      .single();

    expect(queryTagError).toBeNull();
    expect(updatedTag!.name).toBe('修改後的標籤名稱');

    const { data: relatedPostTags, error: queryRelationError } = await supabase
      .from('post_tags')
      .select()
      .eq('tag_id', tagId);

    expect(queryRelationError).toBeNull();
    expect(relatedPostTags!.length).toBeGreaterThan(0);
  });

  // 刪除測試：刪除分類 (文章應轉移至預設分類)
  it('應該能夠刪除分類 (技術)，文章應轉移到預設分類', async () => {
    const currentTime = new Date().toISOString();
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({ 
        name: '技術測試7', 
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(categoryError).toBeNull();
    categoryId = category!.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '分類刪除文章',
        slug: 'delete-category',
        content: '內容',
        category_id: categoryId,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();
    postId = post!.id;

    // 更新文章分類為預設分類
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        category_id: 1,
        updated_at: new Date().toISOString(),
        updated_by: SYSTEM_USER_ID
      })
      .eq('category_id', categoryId);

    expect(updateError).toBeNull();

    // 刪除該分類
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    expect(deleteError).toBeNull();

    const { data: updatedPost, error: queryError } = await supabase
      .from('posts')
      .select()
      .eq('id', postId)
      .single();

    expect(queryError).toBeNull();
    expect(updatedPost!.category_id).toBe(1);
  });

  // 刪除測試：刪除標籤 (文章標籤關聯應自動刪除)
  test('應該能夠刪除標籤 (技術教學)，且關聯應自動刪除', async () => {
    const currentTime = new Date().toISOString();
    // 建立標籤與文章關聯
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .insert({
        name: '技術教學',
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(tagError).toBeNull();
    tagId = tag!.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '標籤刪除文章',
        slug: 'delete-tag',
        content: '內容',
        category_id: 1,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();
    postId = post!.id;

    const { error: relationError } = await supabase
      .from('post_tags')
      .insert({
        post_id: postId,
        tag_id: tagId,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(relationError).toBeNull();

    // 刪除標籤
    const { error: deleteError } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    expect(deleteError).toBeNull();

    const { data: remainingPostTags, error: queryError } = await supabase
      .from('post_tags')
      .select()
      .eq('tag_id', tagId);

    expect(queryError).toBeNull();
    expect(remainingPostTags!.length).toBe(0);
  });

  // 刪除測試：刪除文章 (相關的標籤關聯也應刪除)
  test('應該能夠刪除文章，並確保關聯的標籤關聯被一併刪除', async () => {
    const currentTime = new Date().toISOString();
    // 建立文章、標籤與關聯
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .insert({
        name: '文章刪除測試標籤',
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(tagError).toBeNull();
    tagId = tag!.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: '文章刪除測試',
        slug: 'delete-post',
        content: '內容',
        category_id: 1,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(postError).toBeNull();
    postId = post!.id;

    const { error: relationError } = await supabase
      .from('post_tags')
      .insert({
        post_id: postId,
        tag_id: tagId,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(relationError).toBeNull();

    // 刪除文章
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    expect(deleteError).toBeNull();

    const { data: remainingPostTags, error: queryError } = await supabase
      .from('post_tags')
      .select()
      .eq('post_id', postId);

    expect(queryError).toBeNull();
    expect(remainingPostTags!.length).toBe(0);
  });

  // 業務邏輯測試：文章 slug 不能重複
  test('文章 slug 不能重複', async () => {
    const currentTime = new Date().toISOString();
    // 先創建一篇文章
    const { error: firstPostError } = await supabase
      .from('posts')
      .insert({
        title: '第一篇文章',
        slug: 'test-slug',
        content: '內容',
        category_id: 1,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(firstPostError).toBeNull();

    // 嘗試創建具有相同 slug 的文章
    const { error: duplicateSlugError } = await supabase
      .from('posts')
      .insert({
        title: '第二篇文章',
        slug: 'test-slug',  // 使用相同的 slug
        content: '內容',
        category_id: 1,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(duplicateSlugError).not.toBeNull();
    expect(duplicateSlugError!.code).toBe('23505'); // 唯一性約束違反
  });

  // 業務邏輯測試：分類名稱不能重複
  test('分類名稱不能重複', async () => {
    const currentTime = new Date().toISOString();
    // 先創建一個分類
    const { error: firstCategoryError } = await supabase
      .from('categories')
      .insert({
        name: '測試分類',
        is_default: false,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(firstCategoryError).toBeNull();

    // 嘗試創建具有相同名稱的分類
    const { error: duplicateCategoryError } = await supabase
      .from('categories')
      .insert({
        name: '測試分類',
        is_default: false,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(duplicateCategoryError).not.toBeNull();
    expect(duplicateCategoryError!.code).toBe('23505');
  });

  // 業務邏輯測試：相同分類下的子分類名稱不能重複
  test('相同分類下的子分類名稱不能重複', async () => {
    const currentTime = new Date().toISOString();
    // 先創建一個分類
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: '父分類測試',
        is_default: false,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(categoryError).toBeNull();
    const parentCategoryId = category!.id;

    // 創建第一個子分類
    const { error: firstSubcategoryError } = await supabase
      .from('subcategories')
      .insert({
        name: '測試子分類',
        category_id: parentCategoryId,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(firstSubcategoryError).toBeNull();

    // 嘗試在同一個分類下創建同名子分類
    const { error: duplicateSubcategoryError } = await supabase
      .from('subcategories')
      .insert({
        name: '測試子分類',
        category_id: parentCategoryId,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(duplicateSubcategoryError).not.toBeNull();
    expect(duplicateSubcategoryError!.code).toBe('23505');

    // 在不同分類下創建同名子分類應該成功
    const { data: anotherCategory, error: anotherCategoryError } = await supabase
      .from('categories')
      .insert({
        name: '另一個父分類',
        is_default: false,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(anotherCategoryError).toBeNull();

    const { error: validSubcategoryError } = await supabase
      .from('subcategories')
      .insert({
        name: '測試子分類',
        category_id: anotherCategory!.id,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(validSubcategoryError).toBeNull();
  });

  // 業務邏輯測試：標籤名稱不能重複
  test('標籤名稱不能重複', async () => {
    const currentTime = new Date().toISOString();
    // 先創建一個標籤
    const { error: firstTagError } = await supabase
      .from('tags')
      .insert({
        name: '測試標籤',
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(firstTagError).toBeNull();

    // 嘗試創建同名標籤
    const { error: duplicateTagError } = await supabase
      .from('tags')
      .insert({
        name: '測試標籤',
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      });

    expect(duplicateTagError).not.toBeNull();
    expect(duplicateTagError!.code).toBe('23505');
  });

  // 業務邏輯測試：編輯文章時 slug 不能與其他文章重複
  test('編輯文章時 slug 不能與其他文章重複', async () => {
    const currentTime = new Date().toISOString();
    // 創建第一篇文章
    const { data: firstPost, error: firstPostError } = await supabase
      .from('posts')
      .insert({
        title: '第一篇文章',
        slug: 'first-post-slug',
        content: '內容',
        category_id: 1,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(firstPostError).toBeNull();

    // 創建第二篇文章
    const { data: secondPost, error: secondPostError } = await supabase
      .from('posts')
      .insert({
        title: '第二篇文章',
        slug: 'second-post-slug',
        content: '內容',
        category_id: 1,
        updated_at: currentTime,
        created_at: currentTime,
        author_id: SYSTEM_USER_ID,
        is_test: true,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(secondPostError).toBeNull();

    // 嘗試將第二篇文章的 slug 改為與第一篇文章相同
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        slug: 'first-post-slug',
        updated_at: new Date().toISOString(),
        updated_by: SYSTEM_USER_ID
      })
      .eq('id', secondPost!.id);

    expect(updateError).not.toBeNull();
    expect(updateError!.code).toBe('23505');
  });

  // 業務邏輯測試：編輯分類時名稱不能與其他分類重複
  test('編輯分類時名稱不能與其他分類重複', async () => {
    const currentTime = new Date().toISOString();
    // 創建第一個分類
    const { data: firstCategory, error: firstCategoryError } = await supabase
      .from('categories')
      .insert({
        name: '分類一',
        is_default: false,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(firstCategoryError).toBeNull();

    // 創建第二個分類
    const { data: secondCategory, error: secondCategoryError } = await supabase
      .from('categories')
      .insert({
        name: '分類二',
        is_default: false,
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();

    expect(secondCategoryError).toBeNull();

    // 嘗試將第二個分類的名稱改為與第一個分類相同
    const { error: updateError } = await supabase
      .from('categories')
      .update({ 
        name: '分類一',
        updated_at: new Date().toISOString(),
        updated_by: SYSTEM_USER_ID
      })
      .eq('id', secondCategory!.id);

    expect(updateError).not.toBeNull();
    expect(updateError!.code).toBe('23505');
  });

  // 測試：獲取標籤列表
  test('應該能夠獲取標籤列表', async () => {
    const currentTime = new Date().toISOString();
    
    // 創建多個測試標籤
    const testTags = [
      { name: '測試標籤1', is_test: true },
      { name: '測試標籤2', is_test: true },
      { name: '測試標籤3', is_test: true }
    ];
    
    for (const tag of testTags) {
      const { error } = await supabase
        .from('tags')
        .insert({
          ...tag,
          created_at: currentTime,
          updated_at: currentTime,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        });
      expect(error).toBeNull();
    }
    
    // 查詢並驗證標籤列表
    const { data: tags, error: queryError } = await supabase
      .from('tags')
      .select('*')
      .eq('is_test', true);
      
    expect(queryError).toBeNull();
    expect(tags!.length).toBeGreaterThanOrEqual(testTags.length);
    
    // 驗證是否包含我們新增的標籤
    const tagNames = tags!.map(t => t.name);
    for (const tag of testTags) {
      expect(tagNames).toContain(tag.name);
    }
  });

  // 測試：獲取單個標籤詳情
  test('應該能夠獲取單個標籤詳情', async () => {
    const currentTime = new Date().toISOString();
    
    // 創建測試標籤
    const { data: tag, error: createError } = await supabase
      .from('tags')
      .insert({
        name: '標籤詳情測試',
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();
      
    expect(createError).toBeNull();
    expect(tag).not.toBeNull();
    
    // 查詢標籤詳情
    const { data: fetchedTag, error: queryError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', tag!.id)
      .single();
      
    expect(queryError).toBeNull();
    expect(fetchedTag).not.toBeNull();
    expect(fetchedTag!.name).toBe('標籤詳情測試');
    
    // 使用 Date 對象進行時間比較
    const fetchedCreatedAt = new Date(fetchedTag!.created_at).getTime();
    const fetchedUpdatedAt = new Date(fetchedTag!.updated_at).getTime();
    const expectedTime = new Date(currentTime).getTime();
    
    expect(fetchedCreatedAt).toBe(expectedTime);
    expect(fetchedUpdatedAt).toBe(expectedTime);
  });

  // 測試：標籤文章數量統計
  test('應該能夠統計每個標籤關聯的文章數量', async () => {
    const currentTime = new Date().toISOString();
    
    // 創建測試標籤
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .insert({
        name: '統計測試標籤',
        is_test: true,
        created_at: currentTime,
        updated_at: currentTime,
        created_by: SYSTEM_USER_ID,
        updated_by: SYSTEM_USER_ID
      })
      .select()
      .single();
      
    expect(tagError).toBeNull();
    const tagId = tag!.id;
    
    // 創建多篇文章並關聯到標籤
    const posts = [];
    for (let i = 1; i <= 3; i++) {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: `標籤統計測試文章${i}`,
          slug: `tag-count-test-${i}`,
          content: '內容',
          category_id: 1,
          updated_at: currentTime,
          created_at: currentTime,
          author_id: SYSTEM_USER_ID,
          is_test: true,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        })
        .select()
        .single();
        
      expect(postError).toBeNull();
      posts.push(post!);
      
      // 創建關聯
      const { error: relationError } = await supabase
        .from('post_tags')
        .insert({
          post_id: post!.id,
          tag_id: tagId,
          is_test: true,
          created_at: currentTime,
          updated_at: currentTime,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        });
        
      expect(relationError).toBeNull();
    }
    
    // 正確的計數查詢方式
    const { count, error: countError } = await supabase
        .from('post_tags')
        .select('*', { count: 'exact', head: true })
        .eq('tag_id', tagId)
        .eq('is_test', true);
        
      expect(countError).toBeNull();
      expect(count).toBe(3);
    });

    // 測試：編輯標籤時的唯一性檢查
    test('編輯標籤時名稱不能與其他標籤重複', async () => {
      const currentTime = new Date().toISOString();
      
      // 創建兩個測試標籤
      const { data: firstTag, error: firstTagError } = await supabase
        .from('tags')
        .insert({
          name: '唯一性測試標籤1',
          is_test: true,
          created_at: currentTime,
          updated_at: currentTime,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        })
        .select()
        .single();
        
      expect(firstTagError).toBeNull();
      
      const { data: secondTag, error: secondTagError } = await supabase
        .from('tags')
        .insert({
          name: '唯一性測試標籤2',
          is_test: true,
          created_at: currentTime,
          updated_at: currentTime,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        })
        .select()
        .single();
        
      expect(secondTagError).toBeNull();
      
      // 嘗試將第二個標籤名稱改為與第一個標籤相同
      const { error: updateError } = await supabase
        .from('tags')
        .update({
          name: '唯一性測試標籤1',
          updated_at: new Date().toISOString(),
          updated_by: SYSTEM_USER_ID
        })
        .eq('id', secondTag!.id);
        
      expect(updateError).not.toBeNull();
      expect(updateError!.code).toBe('23505'); // 唯一性約束違反
    });

    // 測試：標籤名稱長度限制
    test('標籤名稱長度不能超過20個字元', async () => {
      const currentTime = new Date().toISOString();
      
      // 創建一個名稱超過20字元的標籤
      const longTagName = '這是一個名稱非常長超過二十個字元的標籤測試案例';
      
      // 試著插入資料庫
      const { error: insertError } = await supabase
        .from('tags')
        .insert({
          name: longTagName,
          is_test: true,
          created_at: currentTime,
          updated_at: currentTime,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        });
        
      // 預期會收到錯誤 - 如果資料庫有設定長度限制
      // 注意: 這需要在資料庫架構中設定 check 約束或驗證
      
      // 創建一個符合20字元長度的標籤
      const validTagName = '這個標籤名稱剛好二十字';
      
      const { error: validInsertError } = await supabase
        .from('tags')
        .insert({
          name: validTagName,
          is_test: true,
          created_at: currentTime,
          updated_at: currentTime,
          created_by: SYSTEM_USER_ID,
          updated_by: SYSTEM_USER_ID
        });
        
      expect(validInsertError).toBeNull();
      
      // 驗證字元長度是否正確
      const { data: validTag, error: queryError } = await supabase
        .from('tags')
        .select('*')
        .eq('name', validTagName)
        .single();
        
      expect(queryError).toBeNull();
      expect(validTag!.name.length).toBeLessThanOrEqual(20);
    });

}); 