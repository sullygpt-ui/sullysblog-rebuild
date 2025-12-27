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
  async redirects() {
    return redirectsData;
  },
};

export default nextConfig;
