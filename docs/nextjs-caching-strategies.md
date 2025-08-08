# Next.js 快取策略

## 概述

Next.js 在其 App Router 中提供了強大的資料快取機制，旨在優化應用程式的性能和用戶體驗。理解這些快取策略對於構建高效且資料即時的應用程式至關重要。

本文件將介紹 Next.js App Router 中主要的資料快取行為，以及如何控制它們以滿足不同場景的需求。

## Next.js App Router 中的資料快取

Next.js 預設會對 Server Components 中的資料獲取進行快取。這包括：

1.  **`fetch` API 的擴展**：Next.js 擴展了原生的 `fetch` API，使其具備自動快取和重新驗證的能力。
2.  **Server Components 的資料獲取**：在 Server Components 中直接進行的資料庫查詢（例如使用 Prisma）也會被 Next.js 視為資料獲取，並應用快取策略。

### 快取行為的類型

Next.js 的快取行為主要分為兩種：

1.  **資料快取 (Data Cache)**：
    *   這是 Next.js 內建的快取機制，用於儲存 `fetch` 請求的結果或 Server Components 獲取的資料。
    *   它存在於伺服器端，並在部署之間持久化（如果部署環境支援）。
    *   預設情況下，如果沒有明確設定 `revalidate`，靜態渲染的頁面資料會被永久快取，直到下次部署。

2.  **全路由快取 (Full Route Cache)**：
    *   Next.js 會快取整個路由的渲染結果（包括 HTML 和資料）。
    *   當用戶導航到一個已快取的路由時，Next.js 可以直接提供快取版本，而無需重新渲染。

## 控制快取策略

你可以透過以下方式來控制 Next.js 的快取行為：

### 1. `revalidate` 選項 (推薦用於 Server Components)

在 Server Components 或 `layout.tsx`、`page.tsx` 檔案中，你可以導出一個 `revalidate` 變數來控制頁面的重新驗證頻率。

*   **`export const revalidate = false;` (預設行為)**
    *   頁面將被靜態渲染 (Static Rendering)。
    *   資料在建構時獲取並快取，直到下次部署才會更新。
    *   適用於內容不常變動的頁面，提供最佳性能。

*   **`export const revalidate = 0;`**
    *   頁面將被動態渲染 (Dynamic Rendering)。
    *   每次請求都會重新獲取資料並渲染頁面。
    *   適用於需要絕對即時資料的頁面，但會增加伺服器負載。

*   **`export const revalidate = N;` (N 為秒數)**
    *   啟用增量靜態生成 (Incremental Static Regeneration, ISR)。
    *   頁面最多每 N 秒重新驗證一次。在 N 秒內，會提供快取版本。
    *   當有新的請求進來時，如果距離上次重新驗證超過 N 秒，Next.js 會在背景重新獲取資料並重新生成頁面，然後在下次請求時提供新的頁面。
    *   適用於內容會定期更新但不需要絕對即時的頁面，平衡了即時性和性能。

    **範例 (`app/(public)/blog/page.tsx`)**：
    ```typescript
    export const revalidate = 60; // 部落格列表頁面每 60 秒重新驗證一次
    ```

### 2. `fetch` API 的 `cache` 選項

當你使用原生的 `fetch` API 時，可以傳遞 `cache` 選項來控制其快取行為：

*   **`cache: 'force-cache'` (預設)**
    *   優先使用快取資料。如果快取中沒有，則發送請求並快取結果。
    *   適用於靜態內容。

*   **`cache: 'no-store'`**
    *   禁用快取。每次都發送請求並獲取最新資料。
    *   適用於需要絕對即時資料的請求。

*   **`cache: 'no-cache'`**
    *   每次都發送請求，但會先檢查快取。如果快取有效，則使用快取。
    *   適用於需要最新資料但可以接受短暫舊資料的場景。

*   **`cache: 'only-if-cached'`**
    *   只使用快取資料。如果快取中沒有，則失敗。
    *   適用於離線模式或嚴格的快取策略。

### 3. `fetch` API 的 `next.revalidate` 選項

你可以為單個 `fetch` 請求設定重新驗證時間，這會覆蓋頁面級別的 `revalidate` 設定：

```typescript
fetch('https://...', { next: { revalidate: 3600 } }); // 該請求的資料快取 1 小時
```

### 4. `noStore()` 函數 (僅限 Canary 或實驗性功能)

如果你使用的是 Next.js 的 Canary 版本或啟用了實驗性功能，可以使用 `unstable_noStore` 函數來禁用 Server Component 的資料快取：

```typescript
import { unstable_noStore as noStore } from 'next/cache';

async function getData() {
  noStore(); // 禁用此函數的快取
  // ... 資料獲取邏輯
}
```

### 5. 按需重新驗證 (On-demand Revalidation)

這是一種更精細的控制方式，允許你在資料更新後手動觸發特定路徑的重新驗證，而無需等待 `revalidate` 時間到期或重新部署。

*   **`revalidatePath(path)`**：重新驗證指定路徑的資料。
*   **`revalidateTag(tag)`**：重新驗證帶有指定標籤的 `fetch` 請求資料。

這通常用於後台管理系統中，當內容（例如部落格文章）被更新、創建或刪除時，觸發相關頁面的重新驗證。

**範例 (在 API 路由中)**：
```typescript
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  // ... 更新資料庫
  revalidatePath('/blog'); // 重新驗證部落格列表頁面
  revalidatePath('/blog/[slug]', 'page'); // 重新驗證動態文章頁面
  return new Response('Data updated and revalidated');
}
```

## 客戶端互動與快取策略 (Client-Side Interaction & Caching Strategy)

### 在 ISR 頁面中處理動態搜尋與過濾

當一個頁面同時採用 ISR (增量靜態再生) 並包含需要即時反饋的互動元件（例如搜尋框、篩選器）時，我們需要一個結合伺服器端快取和客戶端資料獲取的混合策略。

**情境：** 部落格列表頁 (`/blog`) 使用 `revalidate = 60` 進行 ISR，但頁面上有一個搜尋框，使用者期望輸入後能立即看到搜尋結果。

**問題：**
1.  初始頁面由 ISR 提供，是靜態的。
2.  使用者的搜尋輸入是客戶端事件，必須在瀏覽器中觸發 API 請求以獲取動態結果。
3.  若未經處理，每次按鍵都可能觸發 API 呼叫，造成伺服器過度負擔和不良的使用者體驗。

**解決策略：**

這是一個結合了 React Hooks 和 Debouncing 技術的最佳實踐：

1.  **保留 ISR 的初始資料**：頁面首次載入時，直接使用 Next.js 透過 ISR 提供的 `initialPosts`，確保快速的初始載入速度。

2.  **使用 `useEffect` 監聽互動狀態**：在客戶端元件中，使用 `useEffect` 來監聽搜尋關鍵字 (`search`) 或過濾條件 (`categoryId`) 的變化。

3.  **使用 `useRef` 防止首次渲染觸發 API**：為了避免頁面載入時就錯誤地觸發一次 API 呼叫（這會覆蓋掉 ISR 提供的寶貴初始資料），我們使用 `useRef` 來記錄是否為首次渲染。在 `useEffect` 中，如果是首次渲染，則直接跳過，不執行任何操作。

4.  **引入 Debouncing 機制**：
    *   **目的**：防止使用者在快速輸入時，每次按鍵都觸發 API 請求。
    *   **實作**：使用 `use-debounce` 這類成熟的套件，將使用者的輸入狀態（例如 `search`）轉換為一個延遲更新的狀態（`debouncedSearch`）。
    *   **效果**：只有當使用者停止輸入一小段時間（例如 300 毫秒）後，`debouncedSearch` 的值才會更新，進而觸發 `useEffect` 呼叫 API。這在效能和使用者體驗之間取得了絕佳的平衡。

**程式碼範例 (`components/blog/BlogList.tsx`):**

```typescript
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

// ...

export default function BlogList({ initialPosts, ... }) {
  // 1. 初始資料來自 ISR
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  
  // 2. 使用者輸入的即時狀態
  const [search, setSearch] = useState('');
  
  // 4. Debounce 後的狀態，延遲 300ms 更新
  const [debouncedSearch] = useDebounce(search, 300);

  // 3. useRef 旗標，用於跳過首次渲染
  const isInitialRender = useRef(true);

  // ... fetchPosts 函式 ...

  // 核心邏輯：監聽 debouncedSearch 的變化
  useEffect(() => {
    // 如果是首次渲染，則將旗標設為 false 並直接返回
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // 在後續的渲染中，當 debouncedSearch 改變時，呼叫 API 獲取新資料
    fetchPosts(1, { reset: true });
  }, [debouncedSearch, categoryId, subCategoryId, sort]); // 依賴項包含 debounce 後的狀態

  // ...
}
```

這個策略確保了：
*   **高效的首次載入**：得益於 ISR。
*   **流暢的使用者體驗**：搜尋反饋即時，且不會因過多請求而卡頓。
*   **優化的伺服器效能**：透過 Debouncing 大幅減少了不必要的 API 呼叫。

## 總結與建議

*   **靜態內容**：使用預設的快取行為或 `revalidate = false`。
*   **部落格文章等不頻繁更新的內容**：使用 **ISR (`revalidate = N`)**，設定一個合理的秒數（例如 60 秒、300 秒或更長），以平衡即時性和性能。
*   **需要絕對即時的內容**：使用 `revalidate = 0` 或 `fetch` 的 `cache: 'no-store'`。
*   **後台管理系統**：結合 **按需重新驗證**，在資料變更時手動觸發重新驗證，以確保前台資料的即時性。
*   **ISR 頁面上的動態元件**：採用上述的**客戶端互動與快取策略**，結合 `useRef` 和 `debounce`，以實現最佳的混合式體驗。

透過靈活運用這些快取策略，你可以為你的 Next.js 應用程式實現最佳的性能和用戶體驗。
