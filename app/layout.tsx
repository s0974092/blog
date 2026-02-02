import Script from 'next/script';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from '@/app/providers';
import { SITE_CONFIG } from '@/lib/constants';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { LiquidGlassDefs } from '@/components/ui/LiquidGlassDefs';
import { GoogleTagManager } from '@next/third-parties/google';

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
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/yj-brand-logo.png" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LiquidGlassDefs />
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Script
          id="e5Tcw60rYOdDqRsz2NsLs" // Use the Chatbase provided ID from the original script
          src="https://www.chatbase.co/embed.min.js"
          strategy="afterInteractive" // Loads after the page is interactive
          data-domain="www.chatbase.co" // Add data-domain attribute as present in the original script
        />
      </body>
    </html>
  );
}

