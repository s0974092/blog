import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from '@/app/providers';
import { SITE_CONFIG } from '@/lib/constants';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.url),
  
  openGraph: {
    ...SITE_CONFIG.openGraph,
    url: '/',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  twitter: {
    ...SITE_CONFIG.twitter,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  robots: typeof SITE_CONFIG.robots === 'string' ? SITE_CONFIG.robots : undefined,
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
        <SpeedInsights />
      </body>
    </html>
  );
}
