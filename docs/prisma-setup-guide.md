# Prisma 設定指南

本指南將說明如何使用 Prisma 來管理您的 Supabase 資料庫結構。

## 前提條件

*   已安裝 Node.js 和 npm/yarn。
*   已安裝 Prisma CLI (`npm install -g prisma` 或 `yarn add global prisma`)。
*   已設定 Supabase 專案。

## 設定步驟

### 1. 配置資料庫連接

在您的專案根目錄下的 `.env` 檔案中，設定 `DATABASE_URL` 環境變數，指向您的 Supabase 資料庫連接字串。

```dotenv
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_SUPABASE_HOST]:5432/postgres"
```

*   將 `[YOUR_PASSWORD]` 替換為您的 Supabase 資料庫密碼。
*   將 `[YOUR_SUPABASE_HOST]` 替換為您的 Supabase 專案主機位址 (通常可以在 Supabase 儀表板的 "Project Settings" -> "Database" -> "Connection string" 中找到)。

### 2. 定義 Prisma Schema

在 `prisma/schema.prisma` 檔案中定義您的資料庫模型。例如：

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. 將 Prisma Schema 同步到 Supabase 資料庫

當您修改了 `prisma/schema.prisma` 檔案後，可以使用 `npx prisma db push` 指令將本地的 Schema 變更同步到您的 Supabase 資料庫。

```bash
export DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_SUPABASE_HOST]:5432/postgres" # 確保您的環境變數已設定
npx prisma db push
```

*   **重要提示**：`npx prisma db push` 會直接修改資料庫結構，並會丟棄任何資料庫中的資料，如果這些資料與您的 Schema 不符。在生產環境中，建議使用 `prisma migrate deploy` 配合遷移檔案來管理資料庫變更。然而，對於開發階段的快速迭代，`db push` 是一個方便的工具。

### 4. 配置 RLS (Row Level Security) 和 Seed 資料

`npx prisma db push` 主要負責資料庫結構的同步。對於 RLS (Row Level Security) 策略和初始的 Seed 資料，請直接參考 `supabase/migrations` 目錄下的 SQL 檔案。

1.  **登入 Supabase 儀表板**：前往您的 Supabase 專案儀表板。
2.  **導航至 SQL 編輯器**：點擊左側導航欄的 "SQL Editor" (SQL 編輯器) 圖示。
3.  **執行 SQL 檔案**：將 `supabase/migrations` 目錄下的相關 SQL 檔案內容複製並貼上至 Supabase SQL 編輯區執行，以配置 RLS 和初始資料。

## 注意事項

*   **Supabase 遷移與 Prisma 遷移**：請避免同時使用 Supabase CLI 的遷移功能 (`supabase migration new`, `supabase db reset`) 和 Prisma 的遷移功能 (`prisma migrate dev`, `prisma migrate deploy`) 來管理資料庫結構，這會導致衝突。建議選擇其中一種作為主要工具。
*   **生產環境**：在生產環境中，建議使用 `prisma migrate deploy` 配合版本控制的遷移檔案來管理資料庫變更，以確保資料的完整性和可追溯性。
