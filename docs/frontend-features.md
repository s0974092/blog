# 前台功能文件

## 系統架構概覽

本部落格系統採用 Next.js 15 App Router 架構，前台部分主要位於 `app/(public)` 目錄下，提供用戶瀏覽文章、搜尋和閱讀體驗。

## 技術棧

### 核心框架
- **Next.js 15**: 使用 App Router 進行路由管理，支援最新的 React 19
- **TypeScript**: 提供類型安全
- **Tailwind CSS**: 樣式框架
- **Supabase**: 後端服務和身份驗證

### 外部套件整合

#### 1. Yoopta Editor
- **用途**: 富文本編輯器，用於文章內容編輯
- **封裝**: 已封裝到 `components/post/PostEditor.tsx` 組件中
- **使用方式**:
```tsx
import { PostEditor } from '@/components/post/PostEditor'

// 在後台管理頁面中使用
<PostEditor 
  content={content}
  onChange={setContent}
  placeholder="開始撰寫您的文章..."
/>
```

#### 2. Sonner Toast
- **用途**: 用戶操作反饋和錯誤提示
- **配置**: 在 `app/providers.tsx` 中全局配置
- **前台使用場景**:
  - 登入成功/失敗提示
  - 數據獲取錯誤提示
  - 用戶操作反饋
- **使用方式**:
```tsx
import { toast } from 'sonner'

// 成功提示
toast.success('登入成功！')

// 錯誤提示
toast.error('獲取文章列表失敗', { 
  description: error?.message 
})
```

## 前台頁面功能

### 1. 首頁 (`app/page.tsx`)
- **功能**: 部落格首頁，展示最新文章列表
- **特點**: 
  - 響應式設計
  - 文章卡片展示
  - 分頁功能
  - 搜尋功能

### 2. 部落格列表頁 (`app/(public)/blog/`)
- **功能**: 展示所有文章列表
- **特點**:
  - 文章篩選（分類、標籤）
  - 搜尋功能
  - 分頁導航
  - 文章預覽卡片
  - 錯誤處理和用戶提示

### 3. 登入頁面 (`app/(public)/login/`)
- **功能**: 用戶登入
- **特點**:
  - Supabase 身份驗證
  - 表單驗證
  - 錯誤處理
  - 重定向邏輯
  - 登入狀態提示

## 核心組件

### 1. 部落格相關組件 (`components/blog/`)

#### BlogCard.tsx
- **功能**: 文章卡片展示
- **特點**:
  - 響應式設計
  - 文章封面圖片
  - 文章摘要
  - 標籤展示
  - 閱讀時間估算

#### BlogSearchBar.tsx
- **功能**: 文章搜尋
- **特點**:
  - 即時搜尋
  - 搜尋建議
  - 搜尋歷史
  - 鍵盤快捷鍵支援

#### ArticleToc.tsx
- **功能**: 文章目錄導航
- **特點**:
  - 自動生成目錄
  - 滾動高亮
  - 平滑滾動
  - 響應式設計

#### ReadingProgressBar.tsx
- **功能**: 閱讀進度條
- **特點**:
  - 實時進度顯示
  - 可切換顯示/隱藏
  - 平滑動畫

#### ScrollToTop.tsx
- **功能**: 回到頂部按鈕
- **特點**:
  - 滾動觸發顯示
  - 平滑滾動
  - 動畫效果

### 2. 佈局組件 (`components/layout/`)
- **功能**: 頁面佈局管理
- **特點**:
  - 響應式導航
  - 頁腳資訊
  - SEO 優化

## 自定義 Hooks

### 1. useScrollDirection.ts
- **功能**: 監聽頁面滾動方向
- **使用方式**:
```tsx
import { useScrollDirection } from '@/hooks/useScrollDirection'

const scrollDirection = useScrollDirection()
// 返回 'up' 或 'down'
```

### 2. useActiveHeading.ts
- **功能**: 追蹤當前活動的標題
- **使用方式**:
```tsx
import { useActiveHeading, useHeadings } from '@/hooks/useActiveHeading'

const [activeId, setActiveId] = useState('')
const headings = useHeadings(content)

useActiveHeading(setActiveId, [content])
```

## 工具函數 (`lib/utils.ts`)

### 1. cn()
- **功能**: 合併 CSS 類名
- **使用方式**:
```tsx
import { cn } from '@/lib/utils'

const className = cn('base-class', condition && 'conditional-class')
```

### 2. generatePinyin()
- **功能**: 將中文轉換為拼音
- **使用方式**:
```tsx
import { generatePinyin } from '@/lib/utils'

const slug = generatePinyin('中文標題')
// 輸出: 'zhong-wen-biao-ti'
```

### 3. generateFileName()
- **功能**: 生成唯一檔案名稱
- **使用方式**:
```tsx
import { generateFileName } from '@/lib/utils'

const fileName = generateFileName('image.jpg')
// 輸出: '2024-01-01_12-00-00_uuid.jpg'
```

## 身份驗證 (`lib/auth.ts`)

### 主要功能
- 用戶登入 (`signIn`)
- 會話檢查 (`checkSession`)
- 獲取用戶信息 (`getClientUser`)
- 用戶登出 (`signOut`)

### 使用方式
```tsx
import { signIn, getClientUser, signOut } from '@/lib/auth'

// 登入
const result = await signIn({ email, password })

// 獲取用戶信息
const user = await getClientUser()

// 登出
await signOut()
```

## 數據庫連接 (`lib/supabase.ts`)

### 客戶端配置
- 自動處理 cookies
- 瀏覽器環境優化
- 錯誤處理

### 使用方式
```tsx
import { supabase } from '@/lib/supabase'

// 查詢數據
const { data, error } = await supabase
  .from('posts')
  .select('*')
```

## UI 組件庫 (`components/ui/`)

基於 shadcn/ui 的組件庫，包含：
- Button, Input, Textarea
- Dialog, Alert Dialog
- Select, Multi-select
- Table, Pagination
- Card, Badge
- Tooltip, Skeleton

所有組件都經過 TypeScript 優化，支援完整的類型檢查。

## 樣式系統

### 字體配置
- **Geist Sans**: 主要字體
- **Geist Mono**: 等寬字體
- 支援中文顯示優化

### 主題配置
- 使用 Tailwind CSS
- 支援深色/淺色模式
- 響應式設計

## 性能優化

### 1. 圖片優化
- Next.js Image 組件
- 自動格式轉換
- 懶加載

### 2. 代碼分割
- 動態導入
- 路由級別分割
- 組件級別分割

### 3. 緩存策略
- 靜態生成
- CDN 優化
- 瀏覽器緩存

## SEO 優化

### 1. 元數據
- 動態標題
- 描述優化
- Open Graph 標籤

### 2. 結構化數據
- JSON-LD 標記
- 文章結構化
- 作者信息

### 3. 性能指標
- Core Web Vitals
- Lighthouse 優化
- 可訪問性支援 