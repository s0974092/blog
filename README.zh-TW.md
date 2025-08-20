[<img src="https://img.shields.io/badge/English-blue" />](./README.md) [<img src="https://img.shields.io/badge/繁體中文-blue" />](./README.zh-TW.md) [<img src="https://img.shields.io/badge/简体中文-blue" />](./README.zh-CN.md)

# YJ's Tech & Life Notes - 部落格網站

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.zh-TW.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.zh-TW.md)
[![Dependency Check](https://github.com/s0974092/blog/actions/workflows/dependency-check.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/dependency-check.yml)
[![Security Audit](https://github.com/s0974092/blog/actions/workflows/security.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/security.yml)
[![Tests](https://github.com/s0974092/blog/actions/workflows/tests.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/tests.yml)
[![Build & Deploy](https://github.com/s0974092/blog/actions/workflows/ci.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/ci.yml)
[![Deploy to Vercel](https://img.shields.io/badge/deploy%20to-Vercel-black.svg)](https://yj-jason-blog.vercel.app)

一個使用 Next.js 15、TypeScript、Tailwind CSS 和 Supabase **快速且低成本**搭建專業部落格，前端靜態化、後台私有化，專注內容創作，輕鬆管理。

你也可以快速建立一個如同 [YJ's Tech & Life Notes](https://yj-jason-blog.vercel.app) 的博客系統。

![Preview](blog_screenshot.png)

![Frontend Demo](frontend_demo.gif)

![Backend Demo](backend_demo.gif)

⭐ 如果這個專案對您有幫助，請給我們一個 Star！

## 🚀 功能特色

- 📝 富文本編輯器（基於 Slate.js）
- 🎨 現代化響應式設計
- 🔍 全文搜尋功能
- 📱 行動裝置優化
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

更多關於許可證的詳細分析，請參考 [開源許可證分析報告](docs/license_analysis.md)。


## 🔧 安裝與運行

### 前置需求

- Node.js 18+ 
- npm 或 yarn
- Supabase 帳戶
- Vercel 帳戶

### 影片教學

- **完整版 (安裝 + 示範):** [在 YouTube 上觀看](https://youtu.be/LG7CuhAfsUc)
- **僅安裝:** [在 YouTube 上觀看](https://youtu.be/XxWxfSJusfY)
- **僅示範:** [在 YouTube 上觀看](https://youtu.be/KfCgdcI2RrU)

### 安裝步驟

```bash
# 克隆專案
git clone https://github.com/s0974092/blog.git
cd blog

# 安裝依賴
npm install

# 注意：`npm install` 會自動執行 `npx prisma generate` 來生成 Prisma Client。若您手動修改了 `prisma/schema.prisma` 檔案，請記得執行 `npx prisma generate` 來更新 Client。

# 設定環境變數
# 請參考 `.env.example` 檔案來設定您的環境變數。複製此檔案為 `.env.local` 並填入您的設定。
cp .env.example .env.local
# 編輯 .env.local 檔案，填入您的 Supabase 設定
# 未來部署至Vercel或其他相似平台時，需填入對應的環境變數與數值

# 運行開發伺服器
npm run dev
```

### 資料庫設定

關於資料庫的初始化、遷移、Seed 填充以及 RLS (Row-Level Security) 設定的詳細說明，請參考 [資料庫設定指南](docs/database-setup-guide.md)。

### 本機 CI 檢查

在推送代碼到 GitHub 之前，您可以在本機運行檢查以確保 CI/CD 流程能夠順利通過。更多詳細資訊，請參考 [本機開發檢查指南](docs/local-dev-troubleshooting.md)。

### 更多文件

以下是專案中其他重要文件的連結，提供更深入的技術細節和開發指南：

*   [後台功能文件](docs/backend-features.md)
*   [前台功能文件](docs/frontend-features.md)
*   [Next.js 快取策略](docs/nextjs-caching-strategies.md)

## 📁 專案結構

```
blog/
├── app/                         # Next.js App Router
│   ├── (public)/                # 公開頁面路由組
│   │   ├── about/               # 關於我頁面
│   │   │   ├── layout.tsx       # 頁面佈局
│   │   │   └── page.tsx         # 頁面內容
│   │   ├── blog/                # 部落格頁面
│   │   ├── privacy/             # 隱私政策頁面
│   │   │   ├── layout.tsx       # 頁面佈局
│   │   │   └── page.tsx         # 頁面內容
│   │   ├── terms/               # 使用條款頁面
│   │   │   ├── layout.tsx       # 頁面佈局
│   │   │   └── page.tsx         # 頁面內容
│   │   └── login/               # 登入頁面
│   ├── (admin)/                 # 管理後台路由組
│   │   ├── dashboard/           # 儀表板
│   │   ├── posts/               # 文章管理
│   │   ├── categories/          # 分類管理
│   │   ├── sub-categories/      # 子分類管理
│   │   ├── tags/                # 標籤管理
│   │   └── layout.tsx           # 管理後台佈局
│   ├── api/                     # API 路由
│   ├── layout.tsx               # 根佈局
│   ├── page.tsx                 # 首頁
│   ├── providers.tsx            # 全域提供者
│   ├── robots.ts                # 搜尋引擎優化
│   └── sitemap.ts               # 網站地圖
├── components/                  # React 組件
│   ├── ui/                      # 基礎 UI 組件
│   ├── blog/                    # 部落格相關組件
│   ├── post/                    # 文章相關組件
│   ├── category/                # 分類相關組件
│   ├── sub-category/            # 子分類相關組件
│   ├── tag/                     # 標籤相關組件
│   └── layout/                  # 佈局組件
│       ├── public/              # 公開頁面佈局
│       │   ├── Header.tsx       # 頁面標題
│       │   ├── Footer.tsx       # 頁面底部
│       │   └── PublicLayout.tsx # 公開頁面佈局
│       └── admin/               # 管理後台佈局
├── lib/                         # 工具函數和設定
│   ├── utils.ts                 # 通用工具函數
│   ├── constants.ts             # 常數定義
│   ├── auth.ts                  # 身份驗證相關
│   ├── server-auth.ts           # 伺服器端身份驗證
│   ├── supabase.ts              # Supabase 設定
│   └── prisma.ts                # Prisma 設定
├── prisma/                      # 資料庫相關
│   ├── schema.prisma            # 資料庫結構定義
│   └── migrations/              # 資料庫遷移檔案
├── public/                      # 靜態資源
│   ├── images/                  # 圖片資源
│   └── yj-brand-logo.png        # 品牌標誌
├── LICENSE                      # MIT 許可證
├── README.md                    # 專案說明文件
└── package.json                 # 專案依賴配置
```

## 🤝 貢獻指南

我們歡迎社群貢獻！更多詳細資訊，請參考 [貢獻指南](CONTRIBUTING.zh-TW.md)。

## 📜 行為準則

我們希望所有貢獻者都能遵守我們的 [行為準則](CODE_OF_CONDUCT.zh-TW.md)。在參與本專案之前，請花時間閱讀它。

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