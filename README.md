# YJ's Tech & Life Notes - 部落格網站

一個使用 Next.js 15、TypeScript、Tailwind CSS 和 Supabase 建立的現代化部落格網站。

## 📊 專案狀態

### 🏷️ 版本與技術
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/s0974092/blog)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

### 🔧 開發工具
[![npm](https://img.shields.io/badge/npm-latest-blue.svg)](https://www.npmjs.com/)
[![Jest](https://img.shields.io/badge/Jest-Testing-yellow.svg)](https://jestjs.io/)
[![ESLint](https://img.shields.io/badge/ESLint-Code%20Quality-purple.svg)](https://eslint.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue.svg)](https://www.prisma.io/)

### 🗄️ 資料庫與服務
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)](https://www.postgresql.org/)

### 📄 許可證與品質
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Maintenance](https://img.shields.io/badge/maintenance-active-brightgreen.svg)](https://github.com/s0974092/blog)

### 🚀 CI/CD 狀態
[![Dependency Check](https://github.com/s0974092/blog/actions/workflows/dependency-check.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/dependency-check.yml)
[![Security Audit](https://github.com/s0974092/blog/actions/workflows/security.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/security.yml)
[![Tests](https://github.com/s0974092/blog/actions/workflows/tests.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/tests.yml)
[![Build & Deploy](https://github.com/s0974092/blog/actions/workflows/ci.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/ci.yml)
[![Deploy to Vercel](https://img.shields.io/badge/deploy%20to-Vercel-black.svg)]

## 🚀 功能特色

- 📝 富文本編輯器（基於 Slate.js）
- 🎨 現代化響應式設計
- 🔍 全文搜尋功能
- 📱 行動裝置優化
- 🌐 多語言支援
- 🔐 安全的身份驗證
- 📊 內容管理系統

## 🛠️ 技術棧

- **前端框架**: Next.js 15 (React 19)
- **程式語言**: TypeScript
- **樣式框架**: Tailwind CSS
- **資料庫**: Supabase (PostgreSQL)
- **編輯器**: Slate.js + Yoopta
- **UI 組件**: Radix UI
- **動畫**: Framer Motion
- **表單處理**: React Hook Form + Zod

## 📦 開源許可證

本專案採用 **MIT 許可證**，這意味著：

✅ **您可以自由使用** - 用於個人或商業專案  
✅ **您可以修改** - 根據需求調整程式碼  
✅ **您可以分發** - 分享給其他人使用  
✅ **您可以商業使用** - 無需支付授權費用  

唯一的條件是保留原始的版權聲明和許可證聲明。

## 🔧 安裝與運行

### 前置需求

- Node.js 18+ 
- npm 或 yarn
- Supabase 帳戶

### 安裝步驟

```bash
# 克隆專案
git clone https://github.com/s0974092/blog.git
cd blog

# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env.local
# 編輯 .env.local 檔案，填入您的 Supabase 設定

# 運行開發伺服器
npm run dev
```

### 本機 CI 檢查

在推送代碼到 GitHub 之前，您可以在本機運行檢查以確保 CI/CD 流程能夠順利通過：

```bash
# 基本檢查（推薦用於日常開發）
npm run ci:basic

# 快速檢查（包含安全審計）
npm run ci:quick

# 提交前檢查（包含代碼品質檢查）
npm run ci:pre-commit

# 推送前檢查（完整檢查）
npm run ci:pre-push

# 本地完整檢查（模擬 CI/CD 流程）
npm run ci:local
```

#### 檢查內容說明

- **TypeScript 類型檢查** - 確保代碼類型安全
- **單元測試** - 運行 Jest 測試套件
- **代碼品質檢查** - ESLint 靜態代碼分析
- **安全審計** - 檢查依賴包的安全性
- **構建檢查** - 確保 Next.js 應用能夠正常構建

#### 檢查腳本詳情

| 腳本 | 檢查內容 | 用途 | 執行時間 |
|------|----------|------|----------|
| `ci:basic` | TypeScript + 測試 | 日常開發檢查 | ~5秒 |
| `ci:quick` | 基本檢查 + 安全審計 | 推送前快速檢查 | ~10秒 |
| `ci:pre-commit` | 基本檢查 + 代碼品質 | Git 提交前檢查 | ~8秒 |
| `ci:pre-push` | 完整檢查流程 | Git 推送前檢查 | ~15秒 |
| `ci:local` | 模擬 CI/CD 流程 | 本地完整檢查 | ~20秒 |

### 檢查腳本對比

| 檢查項目 | ci:basic | ci:quick | ci:pre-commit | ci:pre-push | ci:local |
|----------|----------|----------|---------------|-------------|----------|
| TypeScript | ✅ | ✅ | ✅ | ✅ | ✅ |
| 單元測試 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 代碼品質 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 安全審計 | ❌ | ✅ | ❌ | ✅ | ✅ |
| 構建檢查 | ❌ | ❌ | ❌ | ✅ | ✅ |

### 代碼品質工具

#### ESLint 配置
專案使用嚴格的 ESLint 規則來確保代碼品質：

- **錯誤級別規則**：未使用變數、prefer-const、debugger 語句
- **警告級別規則**：any 類型、console 語句、React Hook 依賴
- **最佳實踐**：nullish coalescing、optional chaining、類型斷言

#### 自動修復
```bash
# 自動修復 ESLint 問題
npm run lint:fix

# 自動格式化代碼
npm run format-fix
```

### 環境變數設定

```env

# Supabase設定 或 使用類似的資料庫服務平台
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# [Optional] For update DB Schema by Prisma (用於 /prisma/schema.prisma update prisma schema from supabase)
DATABASE_URL=your_database_url

# [Optional] HuggingFace 配置 (使用Prompt來生成文章圖片)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# 網站基礎 URL，用於 SEO 元數據、Open Graph、Twitter 卡片、站點地圖和規範化 URL（開發環境使用 localhost；生產環境應改為實際域名）
NEXT_PUBLIC_SITE_URL=http://localhost:3000

```

## 📁 專案結構

```
blog/
├── app/                          # Next.js App Router
│   ├── (public)/                 # 公開頁面路由組
│   │   ├── about/               # 關於我頁面
│   │   │   ├── layout.tsx      # 頁面佈局
│   │   │   └── page.tsx        # 頁面內容
│   │   ├── blog/               # 部落格頁面
│   │   ├── privacy/            # 隱私政策頁面
│   │   │   ├── layout.tsx      # 頁面佈局
│   │   │   └── page.tsx        # 頁面內容
│   │   ├── terms/              # 使用條款頁面
│   │   │   ├── layout.tsx      # 頁面佈局
│   │   │   └── page.tsx        # 頁面內容
│   │   └── login/              # 登入頁面
│   ├── (admin)/                 # 管理後台路由組
│   │   ├── dashboard/          # 儀表板
│   │   ├── posts/              # 文章管理
│   │   ├── categories/         # 分類管理
│   │   ├── sub-categories/     # 子分類管理
│   │   ├── tags/               # 標籤管理
│   │   └── layout.tsx          # 管理後台佈局
│   ├── api/                     # API 路由
│   ├── layout.tsx              # 根佈局
│   ├── page.tsx                # 首頁
│   ├── providers.tsx           # 全域提供者
│   ├── robots.ts               # 搜尋引擎優化
│   └── sitemap.ts              # 網站地圖
├── components/                   # React 組件
│   ├── ui/                     # 基礎 UI 組件
│   ├── blog/                   # 部落格相關組件
│   ├── post/                   # 文章相關組件
│   ├── category/               # 分類相關組件
│   ├── sub-category/           # 子分類相關組件
│   ├── tag/                    # 標籤相關組件
│   └── layout/                 # 佈局組件
│       ├── public/             # 公開頁面佈局
│       │   ├── Header.tsx      # 頁面標題
│       │   ├── Footer.tsx      # 頁面底部
│       │   └── PublicLayout.tsx # 公開頁面佈局
│       └── admin/              # 管理後台佈局
├── lib/                         # 工具函數和設定
│   ├── utils.ts                # 通用工具函數
│   ├── constants.ts            # 常數定義
│   ├── auth.ts                 # 身份驗證相關
│   ├── server-auth.ts          # 伺服器端身份驗證
│   ├── supabase.ts             # Supabase 設定
│   └── prisma.ts               # Prisma 設定
├── prisma/                      # 資料庫相關
│   ├── schema.prisma           # 資料庫結構定義
│   └── migrations/             # 資料庫遷移檔案
├── public/                      # 靜態資源
│   ├── images/                 # 圖片資源
│   └── yj-brand-logo.png       # 品牌標誌
├── LICENSE                      # MIT 許可證
├── README.md                    # 專案說明文件
└── package.json                 # 專案依賴配置
```

## 🤝 貢獻指南

我們歡迎社群貢獻！請遵循以下步驟：

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 開發規範

- 使用 TypeScript 進行開發
- 遵循 ESLint 規則
- 撰寫清晰的 commit 訊息
- 為新功能添加測試

## 📄 許可證詳情

本專案使用 MIT 許可證 - 詳見 [LICENSE](LICENSE) 檔案。

## 📞 聯絡資訊

- **電子郵件**: s0974092@gmail.com
- **GitHub**: [@s0974092](https://github.com/s0974092)
- **專案地址**: [YJ's Tech & Life Notes](https://github.com/s0974092/blog)

## 🙏 致謝

感謝所有開源專案的貢獻者，特別是：

- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 後端即服務
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Radix UI](https://www.radix-ui.com/) - UI 組件庫
- [Slate.js](https://docs.slatejs.org/) - 富文本編輯器框架

---

⭐ 如果這個專案對您有幫助，請給我們一個 Star！

## 🛠️ 本機開發檢查指南

### 為什麼需要本機檢查？

在推送代碼到 GitHub 之前進行本機檢查可以：

- ✅ **節省時間** - 避免推送後發現錯誤需要重新提交
- ✅ **提高效率** - 快速發現並修復問題
- ✅ **確保品質** - 在本地就確保代碼符合標準
- ✅ **減少 CI 失敗** - 降低 GitHub Actions 失敗的機率

### 檢查流程

#### 1. 日常開發檢查
```bash
# 每次修改代碼後運行
npm run ci:basic
```

#### 2. 提交前檢查
```bash
# 在 git commit 之前運行
npm run ci:pre-commit
```

#### 3. 推送前檢查
```bash
# 在 git push 之前運行
npm run ci:pre-push
```

### 自動化檢查（推薦）

我們已經配置了 Git hooks，會自動在提交和推送前運行檢查：

```bash
# 安裝 husky（如果還沒安裝）
npm install --save-dev husky

# 啟用 Git hooks
npx husky install

# 現在每次 git commit 和 git push 都會自動運行檢查
```

### 檢查失敗時的處理

如果檢查失敗，請按照以下步驟處理：

1. **TypeScript 錯誤**
   ```bash
   # 查看詳細錯誤信息
   npm run type-check
   
   # 修復類型錯誤後重新檢查
   npm run ci:basic
   ```

2. **測試失敗**
   ```bash
   # 查看測試詳情
   npm test
   
   # 修復測試後重新檢查
   npm run ci:basic
   ```

3. **代碼品質問題**
   ```bash
   # 自動修復 ESLint 問題
   npm run lint:fix
   
   # 手動檢查代碼品質
   npm run lint
   ```

4. **安全審計失敗**
   ```bash
   # 查看安全問題詳情
   npm audit
   
   # 修復安全問題
   npm audit fix
   ```

### 檢查腳本對比

| 檢查項目 | ci:basic | ci:quick | ci:pre-commit | ci:pre-push | ci:local |
|----------|----------|----------|---------------|-------------|----------|
| TypeScript | ✅ | ✅ | ✅ | ✅ | ✅ |
| 單元測試 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 代碼品質 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 安全審計 | ❌ | ✅ | ❌ | ✅ | ✅ |
| 構建檢查 | ❌ | ❌ | ❌ | ✅ | ✅ |

### 性能優化建議

- **開發時**：使用 `npm run ci:basic`，只檢查最重要的項目
- **提交前**：使用 `npm run ci:pre-commit`，確保代碼品質
- **推送前**：使用 `npm run ci:pre-push`，完整檢查
- **CI/CD**：使用 `npm run ci:local`，模擬 GitHub Actions

### 故障排除

#### 常見問題

1. **檢查太慢**
   ```bash
   # 只運行 TypeScript 檢查
   npm run type-check
   
   # 只運行測試
   npm test
   ```

2. **內存不足**
   ```bash
   # 增加 Node.js 內存限制
   NODE_OPTIONS="--max-old-space-size=4096" npm run ci:basic
   ```

3. **依賴問題**
   ```bash
   # 清理並重新安裝依賴
   rm -rf node_modules package-lock.json
   npm install
   ```

#### 跳過檢查（不推薦）

如果緊急情況下需要跳過檢查：

```bash
# 跳過 pre-commit hook
git commit --no-verify -m "緊急修復"

# 跳過 pre-push hook
git push --no-verify
```

**注意**：只有在緊急情況下才使用，平時應該修復問題而不是跳過檢查。

### 代碼品質最佳實踐

#### 1. 使用自動修復
```bash
# 自動修復 ESLint 問題
npm run lint:fix

# 自動格式化代碼
npm run format-fix
```

#### 2. 定期檢查
```bash
# 每日開發結束前
npm run ci:basic

# 每週進行完整檢查
npm run ci:local
```

#### 3. 團隊協作
- 在 Pull Request 前運行完整檢查
- 使用 `npm run ci:pre-push` 確保推送的代碼品質
- 定期更新依賴包以修復安全漏洞

---

**💡 提示**：養成在本地運行檢查的習慣，這將大大提高您的開發效率和代碼品質！
