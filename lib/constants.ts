// 聯絡資訊常數
export const CONTACT_INFO = {
  email: 's0974092@gmail.com',
  github: {
    username: 's0974092',
    url: 'https://github.com/s0974092'
  },
  linkedin: {
    username: 'yu-jie-lin-58524a125',
    url: 'https://www.linkedin.com/in/yu-jie-lin-58524a125/'
  },
  website: {
    name: 'Jason Profile',
    url: 'https://jason-profile.vercel.app/'
  }
} as const;

export type ContactInfo = typeof CONTACT_INFO;

// 法律文件相關常數
export const LEGAL_CONFIG = {
  github: {
    repository: 'https://github.com/s0974092/blog',
    issues: 'https://github.com/s0974092/blog/issues'
  },
  contact: {
    email: CONTACT_INFO.email,
    githubIssues: 'https://github.com/s0974092/blog/issues'
  }
} as const;

// 網站基本資訊常數
export const SITE_CONFIG = {
  name: "YJ's Tech & Life Notes",
  description: "一個專注於生活、科技與產品思維分享及感悟的部落格。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? 'http://localhost:3000',
  author: "YJ's Tech & Life Notes",
  keywords: [
    // 核心主軸 (3個) - 網站定位
    "技術部落格", "產品思維", "生活感悟", 
    
    // 主要內容領域 (5個) - 專業領域
    "人機介面設計", "軟體開發", "系統架構", "產品管理", "前端開發",
    
    // 技術棧 (4個) - 具體技術
    "React", "Next.js", "TypeScript", "Node.js",
    
    // 內容性質 (3個) - 分享類型
    "技術分享", "經驗總結", "學習筆記",
    
    // 目標受眾 (3個) - 讀者群體
    "軟體工程師", "產品經理", "設計師"
  ],
  openGraph: {
    type: 'website' as const,
    locale: 'zh_TW' as const,
    siteName: "YJ's Tech & Life Notes",
    images: [
      {
        url: '/yj-brand-logo.png',
        width: 1200,
        height: 630,
        alt: 'YJ\'s Tech & Life Notes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image' as const,
    images: ['/yj-brand-logo.png'],
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
}; 