# 後台功能文件

## 系統架構概覽

後台管理系統位於 `app/(admin)` 目錄下，提供完整的內容管理功能，包括文章、分類、子分類、標籤的管理，以及用戶權限控制。

## 技術棧

### 核心框架
- **Next.js 15**: App Router 架構，支援最新的 React 19
- **TypeScript**: 類型安全
- **Tailwind CSS**: 樣式框架
- **React Query**: 狀態管理和數據獲取
- **Supabase**: 後端服務

### 外部套件整合

#### 1. React Query (TanStack Query)
- **用途**: 數據獲取、緩存和狀態管理
- **配置**: 在 `app/providers.tsx` 中全局配置
- **使用場景**:
  - 文章列表獲取和分頁
  - 分類和標籤管理
  - 數據統計和計數
  - 實時數據同步
- **使用方式**:
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 查詢數據
const { data: postsResponse, isLoading } = useQuery({
  queryKey: ['posts', search, page, pageSize],
  queryFn: async () => {
    const params = new URLSearchParams({
      search,
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    const res = await fetch(`/api/posts?${params}`)
    if (!res.ok) {
      throw new Error('獲取文章列表失敗')
    }
    return res.json()
  },
})

// 修改數據
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    toast.success('文章創建成功！')
  },
  onError: (error) => {
    toast.error(error.message || '創建失敗')
  }
})
```

#### 2. Sonner Toast
- **用途**: 操作反饋和狀態通知
- **配置**: 在 `app/providers.tsx` 中全局配置
- **後台使用場景**:
  - CRUD 操作成功/失敗提示
  - 數據驗證錯誤提示
  - 批量操作結果通知
  - 系統狀態變更提示
  - 用戶權限驗證提示
- **使用方式**:
```tsx
import { toast } from 'sonner'

// 成功提示
toast.success('分類更新成功')

// 錯誤提示
toast.error(error instanceof Error ? error.message : '更新分類失敗')

// 帶描述的錯誤提示
toast.error('操作失敗', { 
  description: '請檢查輸入數據是否正確' 
})

// 在 mutation 中使用
const mutation = useMutation({
  mutationFn: updateCategory,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    toast.success('分類更新成功')
  },
  onError: (error) => {
    toast.error(error instanceof Error ? error.message : '更新分類失敗')
  }
})
```

#### 3. Yoopta Editor
- **用途**: 富文本編輯器
- **封裝位置**: `components/post/PostEditor.tsx`
- **功能特點**:
  - 所見即所得編輯
  - 豐富的格式化選項
  - 圖片上傳支援
  - 代碼塊高亮
  - 表格編輯
  - 自定義組件支援

#### 4. React Hook Form
- **用途**: 表單管理和驗證
- **使用方式**:
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const formSchema = z.object({
  title: z.string().min(1, '標題不能為空'),
  content: z.string().min(1, '內容不能為空'),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
})
```

#### 5. Zod
- **用途**: 數據驗證
- **使用方式**:
```tsx
import * as z from 'zod'

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.any(),
  categoryId: z.number(),
  published: z.boolean().optional(),
})
```

## 後台頁面功能

### 1. 儀表板 (`app/(admin)/dashboard/`)
- **功能**: 管理後台首頁
- **特點**:
  - 數據統計概覽
  - 最近活動
  - 快速操作入口
  - 系統狀態監控

### 2. 文章管理 (`app/(admin)/posts/`)
- **功能**: 文章的 CRUD 操作
- **特點**:
  - 文章列表展示
  - 搜尋和篩選
  - 批量操作
  - 草稿和發布狀態管理
  - 版本控制
  - 操作結果通知

### 3. 分類管理 (`app/(admin)/categories/`)
- **功能**: 文章分類管理
- **特點**:
  - 分類 CRUD
  - 層級結構
  - 排序功能
  - 統計信息
  - 刪除確認和結果通知

### 4. 子分類管理 (`app/(admin)/sub-categories/`)
- **功能**: 子分類管理
- **特點**:
  - 與主分類關聯
  - 獨立管理
  - 統計功能
  - 操作反饋

### 5. 標籤管理 (`app/(admin)/tags/`)
- **功能**: 標籤管理
- **特點**:
  - 標籤 CRUD
  - 使用統計
  - 自動完成
  - 批量操作
  - 相關文章查看

## 核心組件

### 1. 文章相關組件 (`components/post/`)

#### PostEditor.tsx
- **功能**: 文章編輯器
- **特點**:
  - Yoopta Editor 整合
  - 自動保存
  - 版本歷史
  - 協作編輯
  - 自定義工具欄

#### PostForm.tsx
- **功能**: 文章表單
- **特點**:
  - 完整的表單驗證
  - 圖片上傳
  - SEO 優化
  - 預覽功能
  - 自動生成 slug

#### PostImageUploader.tsx
- **功能**: 圖片上傳組件
- **特點**:
  - 拖拽上傳
  - 圖片預覽
  - 格式驗證
  - 壓縮優化
  - CDN 整合

#### context.tsx
- **功能**: 文章編輯上下文
- **特點**:
  - 狀態管理
  - 事件處理
  - 數據同步

### 2. 分類相關組件 (`components/category/`)
- **功能**: 分類管理組件
- **特點**:
  - 樹狀結構
  - 拖拽排序
  - 批量操作
  - 統計顯示

### 3. 子分類組件 (`components/sub-category/`)
- **功能**: 子分類管理
- **特點**:
  - 與主分類關聯
  - 獨立管理界面
  - 數據驗證

### 4. 標籤組件 (`components/tag/`)
- **功能**: 標籤管理
- **特點**:
  - 標籤雲展示
  - 自動完成
  - 使用統計
  - 顏色標記

### 5. 佈局組件 (`components/layout/`)
- **功能**: 後台佈局
- **特點**:
  - 側邊欄導航
  - 頂部工具欄
  - 響應式設計
  - 權限控制

## 數據庫模型

### 1. Post 模型
```prisma
model Post {
  id            String       @id @default(dbgenerated("gen_random_uuid()"))
  title         String?
  slug          String       @unique
  content       Json?
  authorId      String?      @map("author_id")
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @default(now())
  categoryId    Int          @default(1)
  subcategoryId Int?
  createdBy     String?
  updatedBy     String?
  published     Boolean?     @default(false)
  coverImageUrl String?      @map("cover_image_url")
  comments      Comment[]
  tags          PostTag[]
  category      Category     @relation(fields: [categoryId], references: [id])
  subcategory   Subcategory? @relation(fields: [subcategoryId], references: [id])
}
```

### 2. Category 模型
```prisma
model Category {
  id            Int           @id @default(autoincrement())
  name          String
  isDefault     Boolean       @default(false)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @default(now())
  createdBy     String?
  updatedBy     String?
  posts         Post[]
  subcategories Subcategory[]
}
```

### 3. Tag 模型
```prisma
model Tag {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @default(now())
  createdBy String?
  updatedBy String?
  posts     PostTag[]
}
```

## API 路由

### 1. 文章 API (`app/api/posts/`)
- `GET /api/posts` - 獲取文章列表
- `POST /api/posts` - 創建新文章
- `GET /api/posts/[id]` - 獲取單篇文章
- `PUT /api/posts/[id]` - 更新文章
- `DELETE /api/posts/[id]` - 刪除文章

### 2. 分類 API (`app/api/categories/`)
- `GET /api/categories` - 獲取分類列表
- `POST /api/categories` - 創建分類
- `PUT /api/categories/[id]` - 更新分類
- `DELETE /api/categories/[id]` - 刪除分類

### 3. 標籤 API (`app/api/tags/`)
- `GET /api/tags` - 獲取標籤列表
- `POST /api/tags` - 創建標籤
- `PUT /api/tags/[id]` - 更新標籤
- `DELETE /api/tags/[id]` - 刪除標籤

## 身份驗證與權限

### 1. 服務端認證 (`lib/server-auth.ts`)
- **功能**: 服務端用戶驗證
- **特點**:
  - JWT 驗證
  - 角色權限控制
  - 會話管理
  - 安全中間件

### 2. 權限控制
- **管理員權限**: 完整 CRUD 操作
- **編輯者權限**: 文章編輯和發布
- **作者權限**: 文章創建和編輯
- **審核者權限**: 內容審核

## 文件上傳

### 1. 圖片上傳
- **支援格式**: JPG, PNG, GIF, WebP
- **大小限制**: 10MB
- **自動壓縮**: 圖片優化
- **CDN 整合**: 自動分發

### 2. 文件管理
- **組織結構**: 按日期和類型分類
- **版本控制**: 文件版本管理
- **清理機制**: 自動清理未使用文件

## 數據驗證

### 1. 表單驗證
```tsx
const postSchema = z.object({
  title: z.string().min(1, '標題不能為空').max(100, '標題不能超過100字'),
  slug: z.string().min(1, 'Slug不能為空').regex(/^[a-z0-9-]+$/, 'Slug只能包含小寫字母、數字和連字符'),
  content: z.any(),
  categoryId: z.number().min(1, '請選擇分類'),
  published: z.boolean().optional(),
  tags: z.array(z.number()).optional(),
})
```

### 2. API 驗證
- 輸入數據驗證
- 類型檢查
- 安全過濾
- 錯誤處理

## 性能優化

### 1. 數據獲取
- React Query 緩存
- 樂觀更新
- 背景同步
- 錯誤重試

### 2. 組件優化
- React.memo
- useMemo
- useCallback
- 虛擬滾動

### 3. 圖片優化
- Next.js Image
- 懶加載
- 格式轉換
- 響應式圖片

## 錯誤處理

### 1. 全局錯誤處理
```tsx
// 錯誤邊界
<ErrorBoundary fallback={<ErrorFallback />}>
  <AdminLayout />
</ErrorBoundary>
```

### 2. API 錯誤處理
```tsx
try {
  const result = await createPost(data)
  toast.success('文章創建成功！')
} catch (error) {
  toast.error(error.message || '創建失敗')
}
```

### 3. 表單錯誤處理
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange',
})

// 顯示錯誤信息
{form.formState.errors.title && (
  <p className="text-red-500">{form.formState.errors.title.message}</p>
)}
```

## 監控與日誌

### 1. 操作日誌
- 用戶操作記錄
- 系統事件記錄
- 錯誤日誌
- 性能監控

### 2. 審計追蹤
- 數據變更記錄
- 用戶活動追蹤
- 安全事件記錄

## 部署與維護

### 1. 環境配置
- 開發環境
- 測試環境
- 生產環境
- 環境變數管理

### 2. 備份策略
- 數據庫備份
- 文件備份
- 版本控制
- 災難恢復

### 3. 監控告警
- 系統監控
- 性能監控
- 錯誤告警
- 容量規劃 