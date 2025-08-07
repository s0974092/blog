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

## 總結與建議

*   **靜態內容**：使用預設的快取行為或 `revalidate = false`。
*   **部落格文章等不頻繁更新的內容**：使用 **ISR (`revalidate = N`)**，設定一個合理的秒數（例如 60 秒、300 秒或更長），以平衡即時性和性能。
*   **需要絕對即時的內容**：使用 `revalidate = 0` 或 `fetch` 的 `cache: 'no-store'`。
*   **後台管理系統**：結合 **按需重新驗證**，在資料變更時手動觸發重新驗證，以確保前台資料的即時性。

透過靈活運用這些快取策略，你可以為你的 Next.js 應用程式實現最佳的性能和用戶體驗。
