# 資料庫設定指南

本指南將說明如何設定和管理您的 Supabase 資料庫結構，並整合 Prisma 的使用方式。

## 前提條件

*   已安裝 Node.js 和 npm/yarn。
*   已安裝 [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)。
*   已安裝 Prisma CLI (`npm install -g prisma` 或 `yarn add global prisma`)。
*   已設定 Supabase 專案。

## 首次登入系統的準備

在您完成本地環境設定後，若要首次登入本系統，請依照以下步驟在 Supabase 儀表板中建立一個測試帳號：

1.  登入您的 Supabase 專案儀表板。
2.  導航至左側選單的 **Authentication** -> **Users**。
3.  點擊 **Invite** 或 **Add user** 按鈕。
4.  輸入一個有效的 Email 和您自訂的密碼。
5.  **請務必記住您設定的密碼**，因為本系統的登入頁面會直接使用此帳號密碼進行驗證。若忘記密碼，您需要回到 Supabase 儀表板的 Users 頁面手動重設。

## 設定步驟：Supabase CLI 為主導

本專案推薦使用 Supabase CLI 來管理資料庫結構和遷移，因為它能確保本地開發環境與遠端 Supabase 專案的一致性，並處理 RLS (Row-Level Security) 和初始資料的填充。

**注意**：雖然本指南主要側重於透過 Supabase CLI 將本地遷移推送到遠端專案，您也可以透過 `supabase start` 指令在本地啟動一個完整的 Supabase 服務棧（包括 PostgreSQL 資料庫、認證、儲存等）進行本地開發與調適。然而，此方式不在本次搭建的重點流程中。

### 1. 初始化/連結 Supabase 專案

如果您的專案尚未初始化 Supabase，或需要連結到遠端專案：

*   **全新專案初始化** (如果 `supabase/` 資料夾不存在)：
    ```bash
    supabase init
    ```
*   **連結到遠端專案** (如果 `supabase/` 資料夾已存在，且需要與遠端同步)：
    ```bash
    supabase login
    supabase link --project-ref YOUR_PROJECT_ID # 將 YOUR_PROJECT_ID 替換為您的專案 ID
    *   **如何找到 YOUR_PROJECT_ID**：
        1.  登入您的 Supabase 儀表板。
        2.  選擇您的專案。
        3.  導航至左側選單的 **Project Settings** (專案設定)。
        4.  在 "General" (一般) 設定頁面中，您會找到 **Project ID**。
    ```

### 2. 定義資料庫結構 (透過遷移)

所有資料庫結構的變更都應透過遷移檔案來管理。這是您定義資料表、欄位、關聯等資料庫骨架的地方。

*   **此專案已提供初始資料庫結構的遷移檔案**：`supabase/migrations/<timestamp>_create_tables.sql`。
*   如果您需要新增或修改資料表結構，請執行：
    ```bash
    supabase migration new your_descriptive_migration_name
    ```
    然後打開新建立的檔案，將您的 `CREATE TABLE`、`ALTER TABLE` 等 SQL 語法貼入其中。

### 3. 部署到遠端 Supabase 專案

當您在本地完成開發並測試無誤後，可以使用 `supabase db push` 將本地的遷移檔案推送到遠端專案。這也是將資料庫結構、RLS Policy 和初始資料應用到遠端資料庫的主要方式。

```bash
supabase db push
```

*   **常見問題：本地與遠端遷移衝突 (push 失敗)**
    *   當您執行 `supabase db push` 時，可能會遇到 `Remote migration versions not found in local migrations directory.` 或 `The remote database's migration history does not match local files in supabase/migrations directory.` 等錯誤。這表示本地的遷移歷史與遠端資料庫的遷移歷史不一致。
    *   **診斷差異**：您可以透過 `supabase migration list` 指令來查看本地和遠端遷移之間的差異。例如，輸出可能如下所示：
        ```
        Local          | Remote         | Time (UTC)
        ---------------|----------------|---------------------
                       | 20250810132536 | 2025-08-10 13:25:36
                       | 20250810133228 | 2025-08-10 13:32:28
        20250811112059 |                | 2025-08-11 11:20:59
        20250811112249 |                | 2025-08-11 11:22:49
        20250811112257 |                | 2025-08-11 11:22:57
        ```
        *   `Local` 欄位有時間戳而 `Remote` 欄位為空，表示這些遷移只存在於本地，尚未推送到遠端。
        *   `Remote` 欄位有時間戳而 `Local` 欄位為空，表示這些遷移只存在於遠端，本地缺少這些檔案。
    *   **解決方案**：
        *   **確保 Git 同步**：首先，請務必確保您的本地 Git 儲存庫是最新的 (`supabase db pull`)，以防缺少遠端已有的遷移檔案。
        *   **修復遠端遷移歷史 (謹慎操作)**：如果 `supabase db push` 後問題仍然存在，且您確認遠端資料庫的遷移歷史需要被修正以匹配本地，您可能需要使用 `supabase migration repair` 指令。這個指令會修改遠端資料庫中 `supabase_migrations` 表的狀態。
            *   例如，如果 `supabase migration list` 顯示遠端有您本地沒有的舊遷移（如範例中的 `20250810132536`），您可以考慮將其狀態標記為 `reverted` (如果這些遷移實際上不應該存在於遠端，或者您希望它們被忽略)：
                ```bash
                supabase migration repair --status reverted 20250810132536
                ```
            *   **警告**：`repair` 指令非常強大且具有潛在風險，它只修改遷移歷史記錄，而不改變實際的資料庫 Schema。請務必在理解其影響後再執行，通常在開發環境中，如果資料可以接受遺失，重設遠端資料庫 (`Reset Database` via Supabase Dashboard) 是更簡單且安全的解決方案。
        *   **拉取遠端 Schema**：如果本地的 Schema 與遠端不一致，您也可以嘗試 `supabase db pull` 來從遠端資料庫拉取最新的 Schema 並生成對應的本地遷移檔案。

## 整合 Prisma

雖然 Supabase CLI 是管理資料庫結構的主要工具，但您仍然可以使用 Prisma 來定義您的應用程式模型並生成 Prisma Client。

### 1. 定義 Prisma Schema

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
  createdAt DateTime @default(now()) @updatedAt
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now()) @updatedAt
}
```

### 2. 配置資料庫連接 (供 Prisma 使用)

在您的專案根目錄下的 `.env` 檔案中，設定 `DATABASE_URL` 環境變數，指向您的 Supabase 資料庫連接字串。

```dotenv
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_SUPABASE_HOST]:5432/postgres"
```

*   將 `[YOUR_PASSWORD]` 替換為您的 Supabase 資料庫密碼。
*   將 `[YOUR_SUPABASE_HOST]` 替換為您的 Supabase 專案主機位址 (通常可以在 Supabase 儀表板的 "Project Settings" -> "Database" -> "Connection string" 中找到)。

### 3. 同步 Prisma Schema 與實際資料庫

當您修改了 `prisma/schema.prisma` 檔案後，可以使用 `prisma db push` 指令將本地的 Schema 變更同步到您的 Supabase 資料庫。

```bash
export DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_SUPABASE_HOST]:5432/postgres" # 確保您的環境變數已設定
prisma db push
```

*   **重要提示**：`prisma db push` 會直接修改資料庫結構，並會丟棄任何資料庫中的資料，如果這些資料與您的 Schema 不符。然而，對於開發階段的快速迭代，`db push` 是一個方便的工具。
*   **注意**：此方法主要用於快速同步 Schema。若您在開發過程中遇到 `Drift detected: Your database schema is not in sync with your migration history.` 警告，Prisma 可能會建議執行 `prisma migrate reset`。請注意，`prisma migrate reset` 會**清除整個資料庫**，包括所有資料和 Prisma 用於記錄遷移歷史的 `_prisma_migrations` 資料表。因此，執行此指令會導致資料遺失，請務必謹慎操作。

### 4. Prisma Seed (可選)

如果您希望透過 Prisma 的 Seed 機制來填充初始資料，可以在 `prisma/seed.ts` 中編寫 Seed 腳本，並在 `package.json` 中配置：

```json
// package.json
{
  "scripts": {
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```
然後執行：
```bash
npx prisma db seed
```
或在 `prisma migrate reset` 時自動執行。

## 重要注意事項

*   **資料庫來源**：在這種工作流程中，您的 Supabase 資料庫 (無論是本地還是遠端) 是資料庫結構的「真實來源」。
*   **避免遷移系統衝突**：請避免同時使用 Supabase CLI 的遷移功能 (`supabase migration new`, `supabase db reset`) 和 Prisma 的遷移功能 (`prisma migrate dev`) 來管理資料庫結構，這會導致衝突。**建議選擇 Supabase CLI 作為主要工具。**
*   **Prisma 同步**：在資料庫結構變更後，請務必執行 `prisma db pull` 來更新您的 `prisma/schema.prisma` 檔案，以確保 Prisma Client 與資料庫結構同步。
*   **避免 `prisma migrate dev`**：由於 Supabase 負責管理資料庫遷移，請**不要**使用 `prisma migrate dev`，這會導致兩個不同的遷移系統產生衝突。