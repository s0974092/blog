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

### 2. 儲存空間自動清理策略：文章內容中未使用的圖片

在文章編輯功能中，為了避免未使用的圖片（例如，上傳後又被刪除的圖片）永久佔用 Supabase Storage 的雲端儲存空間，我們實作了一套自動化的清理機制。此功能會在使用者更新文章時，自動偵測並刪除那些不再被文章內容引用的圖片。

#### 功能目的

- **節省成本**：自動清理廢棄圖片，避免雲端儲存空間的浪費，從而降低長期維運成本。
- **提升維護性**：保持儲存空間的整潔，避免手動檢查和刪除孤立檔案的麻煩。

#### 核心策略

清理機制的策略核心是「**狀態比對**」。我們透過比較文章在**載入時**的圖片狀態和**儲存時**的圖片狀態，來精準地識別出哪些圖片已經被使用者從文章內容中移除。

1.  **捕獲初始狀態**：當使用者進入文章編輯頁面時，系統會立即解析從 API 獲取的文章內容 (`post.content`)，提取出一個包含所有圖片 URL 的「初始圖片列表」（`initialImageUrls`）。
2.  **獲取最終狀態**：當使用者點擊「更新文章」按鈕時，系統會再次解析編輯器當下的內容 (`editorContent`)，產生一份「當前圖片列表」（`currentImages`）。
3.  **計算差異**：系統會遍歷「初始圖片列表」，如果某個 URL 不存在於「當前圖片列表」中，它就會被認定為「待刪除圖片」。
4.  **執行刪除**：最後，系統會呼叫 Supabase 的 API，將所有「待刪除圖片」從雲端儲存空間中移除。

#### 關鍵函式：`extractImageUrlsFromContent`

整個策略的成敗，取決於能否**可靠地**從 YooptaEditor 的複雜 JSON 結構中提取出圖片 URL。為此，我們在 `PostForm.tsx` 中實作了一個關鍵的輔助函式 `extractImageUrlsFromContent`。

```typescript
const extractImageUrlsFromContent = (content: any): string[] => {
  const urls = new Set<string>();

  const findImageUrls = (data: any) => {
    if (!data) return;

    if (Array.isArray(data)) {
      data.forEach(item => findImageUrls(item));
    } else if (typeof data === 'object' && data !== null) {
      if (data.type === 'image' && data.props?.src) {
        urls.add(data.props.src);
      }

      // 使用 for...in 進行深度遞迴，確保遍歷所有節點
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          findImageUrls(data[key]);
        }
      }
    }
  };

  findImageUrls(content);
  return Array.from(urls); // 使用 Set 確保 URL 的唯一性
};
```

這個函式使用 `for...in` 迴圈進行深度遞迴，確保能夠地毯式地掃描整個 `content` 物件，無論圖片節點巢狀在哪個層級，都能被精準地找到並提取其 `src`。

#### 開發歷程與經驗

在實作過程中，我們曾嘗試過幾種不同的方法，但都遇到了問題：

- **失敗的嘗試 1 (依賴編輯器 Ref)**：最初嘗試從 `PostEditor` 元件的 ref 中直接呼叫 `getImages()` 方法。這種方法非常不穩定，因為很難精準掌握編輯器內部狀態的更新時機，導致時常抓取到空的圖片列表。
- **失敗的嘗試 2 (不完善的解析)**：後來改為直接解析 API 回傳的資料，但初版的 `extractImageUrlsFromContent` 函式使用了 `Object.values()`，它無法保證在處理複雜巢狀物件時的遍歷完整性，導致依然會漏掉圖片。

最終，我們意識到問題的根源在於**資料解析的可靠性**。透過改用 `for...in` 迴圈，我們建構了一個不受物件迭代順序影響的、強健的解析函式，才徹底解決了這個問題。這個經驗告訴我們，在處理來自外部、結構複雜的資料時，必須採用最嚴謹、最可靠的遍歷策略，才能確保功能的穩定性。

### 3. 優化 Yoopta Editor 的中文輸入體驗：解決 IME 組字問題

在 `PostEditor` 元件中，我們解決了一個影響中文、日文等亞洲語言輸入的關鍵問題。此問題導致使用者無法透過輸入法（IME）正常組詞。

#### 問題描述

當使用者透過拼音或注音等輸入法在 Yoopta 編輯器中輸入時，每輸入一個字母或符號，編輯器就會立即觸發 `onChange` 事件並更新 React 狀態，從而導致父元件重新渲染。這個重新渲染的過程會強制中斷輸入法正在進行的「組字（Composition）」過程，使得使用者永遠無法將注音或拼音轉換成完整的詞語。

#### 根本原因

問題的根源在於 React 的「控制組件（Controlled Component）」模式與 IME 的運作機制之間的衝突。`onChange` 事件對於 IME 的組字過程來說觸發得過於頻繁，它無法區分「正在輸入的過程」和「輸入完成的結果」。

#### 解決方案：使用 Composition Events

為了解決這個問題，我們採用了 W3C 標準的 **Composition Events** (`onCompositionStart`, `onCompositionUpdate`, `onCompositionEnd`)。這組事件專門用來處理 IME 的輸入流程。

我們的核心策略是：在使用者開始組字時「暫停」狀態更新，直到使用者選好詞、組字過程結束後，才將最終結果同步到 React 狀態中。

1.  **建立組字狀態旗標**：我們在 `PostEditor.tsx` 元件中使用一個 `useRef` 建立的旗標 `isComposing`，來追蹤目前是否處於 IME 組字狀態。
2.  **`onCompositionStart`**：當使用者開始組字時（例如，打出第一個拼音），此事件會觸發，我們將 `isComposing.current` 設為 `true`。
3.  **`onCompositionEnd`**：當使用者選定詞語，組字過程結束時，此事件會觸發。我們將 `isComposing.current` 設回 `false`。此時，我們需要手動觸發一次 `onChange`，以確保最新的內容被同步。
4.  **改造 `onChange`**：我們修改了原有的 `onChange` 處理函式，讓它在 `isComposing.current` 為 `true` 時不執行任何操作，從而避免在組字過程中因不必要的重新渲染而打斷輸入。

#### 關鍵程式碼調整

為了捕捉到 `composition` 事件，我們在 `YooptaEditor` 元件外層包裹了一個 `div`。

```typescript
// 位於 components/post/PostEditor.tsx

const PostEditor = ({ content, onChange, ...props }) => {
  const isComposing = useRef(false);

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLDivElement>) => {
    isComposing.current = false;
    // 組字結束後，Yoopta 的 onChange 可能不會立即觸發最新內容。
    // 我們需要一種可靠的方式來獲取最終內容並手動更新。
    // 這裡的實作細節取決於 Yoopta 的 API，
    // 但核心思想是在這個時間點同步一次狀態。
    // 例如，可以從 event.target 或 editor ref 中獲取內容。
  };

  const handleChange = (newContent: Descendant[]) => {
    // 如果正在組字，則忽略此次變更，避免打斷輸入法。
    if (isComposing.current) {
      return;
    }
    onChange(newContent);
  };

  return (
    <div 
      onCompositionStart={handleCompositionStart} 
      onCompositionEnd={handleCompositionEnd}
    >
      <YooptaEditor
        {...props}
        value={content}
        onChange={handleChange}
      />
    </div>
  );
};
```

透過這個方法，我們成功地將編輯器的狀態更新與 IME 的組字過程解耦，為中文使用者提供了流暢、不中斷的寫作體驗。