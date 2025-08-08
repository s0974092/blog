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

### 2. generateFileName()
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

## 開發經驗與解決方案

### 1. 複雜表單狀態管理：以 `PostForm` 為例

在開發後台文章編輯功能（`components/post/PostForm.tsx`）時，我們遇到了一個關於下拉選單（`Select`）在編輯模式下的狀態同步問題。這個問題的核心在於**狀態表示的不一致性**，導致 UI 行為不符合預期。

#### 問題描述

當使用者在編輯模式下，試圖將一個已經選定的主題（`categoryId`）重設為「請選擇主題」時，UI 會自動跳回先前儲存的選項，而不是停留在「請選擇主題」的 placeholder 狀態。

#### 根本原因

這個問題的根源在於整個元件中，用來表示「未選擇」或「空值」的狀態是混亂的，同時存在 `undefined`、`null` 和空字串 `""` 三種情況，導致了 `react-hook-form` 的狀態管理與 `shadcn/ui` 的 `Select` 元件之間的互動出現問題。

1.  **狀態表示不一**：表單的預設值、UI 的操作邏輯和 Zod 的驗證模型對於「空值」的定義不統一。
2.  **UI 元件行為**：`Select` 元件在接收到 `undefined` 或 `null` 的 `value` 屬性時，其顯示 placeholder 的行為不穩定，容易在 `react-hook-form` 重新渲染時，因為找不到對應的 `value` 而跳回上一個有效的選項。

#### 解決方案：統一狀態表示

為了解決這個問題，我們採取了系統性的重構，核心思想是**統一狀態表示**，讓整個元件只使用一種方式來代表「空值」。

1.  **統一使用 `null`**：我們將 `null` 定義為整個元件中唯一的「空值」表示。
2.  **修改 Zod Schema**：更新了 `categoryId` 的驗證規則，使其明確接受 `number | null`，並透過 `.refine()` 方法將 `null` 視為一個無效的輸入，從而觸發「請選擇主題」的錯誤提示。
3.  **更新表單預設值**：將 `categoryId` 和 `subCategoryId` 的 `defaultValue` 從 `undefined` 修改為 `null`。
4.  **重構核心函式與事件處理**：
    *   修改了 `handleCategoryChange` 函式，使其能正確處理傳入 `null` 的情況。
    *   修改了下拉選單的 `onValueChange` 事件，確保在清空選項時，是使用 `form.setValue('...', null)` 來更新表單狀態。
    *   最後，調整了 `Select` 元件的 `value` 屬性為 `field.value?.toString() ?? ""`，確保當表單狀態為 `null` 時，UI 元件能正確地接收到一個空字串，從而穩定地顯示 placeholder。 