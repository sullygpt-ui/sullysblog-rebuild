import type { NextConfig } from "next";
import redirectsData from './redirects.json';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mqiolwqitoquzdrrwbpj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async rewrites() {
    return [
      // Handle /category/domians/feed/ (typo URL) -> domains feed
      {
        source: '/category/domians/feed',
        destination: '/api/feed?cat=domains',
      },
      {
        source: '/category/domians/feed/',
        destination: '/api/feed?cat=domains',
      },
      // Handle /category/:slug/feed/ -> category feed
      {
        source: '/category/:slug/feed',
        destination: '/api/feed?cat=:slug',
      },
      {
        source: '/category/:slug/feed/',
        destination: '/api/feed?cat=:slug',
      },
    ];
  },
  async redirects() {
    return redirectsData;
  },
};

export default nextConfig;
