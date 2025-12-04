import Script from 'next/script';
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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID; // Get GTM ID from env
  return (
    <html lang="zh-TW">
      <head>
        {/* Google Tag Manager */}
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}
        {/* End Google Tag Manager */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/yj-brand-logo.png" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        {gtmId && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        )}
        {/* End Google Tag Manager (noscript) */}
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
