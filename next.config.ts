import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    /**
     * `remotePatterns` is a security feature to prevent malicious users from using your Next.js server as an open proxy.
     * It allows you to define a whitelist of external domains from which your application can optimize and serve images using the `next/image` component.
     * Only images from the specified hostnames will be processed.
     *
     * @see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fabkqiknvygvjjqhkwtu.supabase.co',
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
