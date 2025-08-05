# YJ's Tech & Life Notes - 部落格網站

一個使用 Next.js 15、TypeScript、Tailwind CSS 和 Supabase 建立的現代化部落格網站。

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

### 環境變數設定

```env
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 其他設定
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
