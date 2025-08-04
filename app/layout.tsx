import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from '@/app/providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "我的部落格 - 分享技術與生活",
    template: "%s | 我的部落格"
  },
  description: "一個專注於生活、科技與產品思維分享及感悟的部落格，提供高品質的技術文章和實用教程。",
  keywords: [
    // 核心主軸 (3個) - 網站定位
    "SaaS", "產品思維", "技術部落格", "育兒", "生活修煉", 
    
    // 主要內容領域 (4個) - 專業領域
    "程式開發", "網頁設計", "軟體開發", "產品管理",
    
    // 內容性質 (2個) - 分享類型
    "技術分享", "產品經驗",
    
    // 目標受眾 (2個) - 讀者群體
    "開發者", "產品經理"
  ],
  authors: [{ name: "部落格作者" }],
  creator: "部落格作者",
  publisher: "我的部落格",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: '/',
    title: "我的部落格 - 分享技術與生活",
    description: "一個專注於技術分享、生活感悟的部落格平台，提供高品質的技術文章和實用教程。",
    siteName: "我的部落格",
    images: [
      {
        url: '/blog.svg',
        width: 1200,
        height: 630,
        alt: '我的部落格',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "我的部落格 - 分享技術與生活",
    description: "一個專注於技術分享、生活感悟的部落格平台，提供高品質的技術文章和實用教程。",
    images: ['/blog.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // 需要替換為實際的Google驗證碼
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/blog.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/blog.svg" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
