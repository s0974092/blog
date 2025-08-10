# Supabase 本地開發環境設定指南 (從零開始)

本指南將說明如何使用 Supabase CLI 從零開始設定本地開發環境，包括資料庫結構、RLS (Row-Level Security) 策略和初始種子資料。

## 前提條件

*   已安裝 [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)。

## 首次登入系統的準備

在您完成本地環境設定後，若要首次登入本系統，請依照以下步驟在 Supabase 儀表板中建立一個測試帳號：

1.  登入您的 Supabase 專案儀表板。
2.  導航至左側選單的 **Authentication** -> **Users**。
3.  點擊 **Invite** 或 **Add user** 按鈕。
4.  輸入一個有效的 Email 和您自訂的密碼。
5.  **請務必記住您設定的密碼**，因為本系統的登入頁面會直接使用此帳號密碼進行驗證。若忘記密碼，您需要回到 Supabase 儀表板的 Users 頁面手動重設。

## 設定步驟

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
    ```

### 2. 定義初始資料庫結構 (透過遷移)

所有資料庫結構的變更都應透過遷移檔案來管理。這是您定義資料表、欄位、關聯等資料庫骨架的地方。

```bash
supabase migration new initial_schema
```
*   打開 `supabase/migrations/<timestamp>_initial_schema.sql`，將您的 `CREATE TABLE`、`CREATE INDEX`、`ALTER TABLE` 等 SQL 語法貼入其中。如果您是從現有資料庫匯出結構，也可以將匯出的 SQL 貼在這裡。
*   **注意**：如果您的專案倉庫中已經包含了 `supabase/migrations` 資料夾，並且其中已有定義資料庫結構的 SQL 檔案，則您可以跳過手動建立此檔案的步驟。

### 3. 重設並應用所有遷移

這是將所有定義應用到本地資料庫的關鍵步驟。

```bash
supabase db reset
```
*   此指令會清除本地資料庫，然後依序執行 `supabase/migrations/` 資料夾中的所有 SQL 檔案 (包括結構、RLS 和種子資料)。

## 重要注意事項

*   **資料庫來源**：在這種工作流程中，您的 Supabase 資料庫 (無論是本地還是遠端) 是資料庫結構的「真實來源」。
*   **Prisma 同步**：在資料庫結構變更後，請務必執行 `prisma db pull` 來更新您的 `prisma/schema.prisma` 檔案，以確保 Prisma Client 與資料庫結構同步。
*   **避免 `prisma migrate dev`**：由於 Supabase 負責管理資料庫遷移，請**不要**使用 `prisma migrate dev`，這會導致兩個不同的遷移系統產生衝突。