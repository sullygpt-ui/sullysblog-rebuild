import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/store/checkout/',
          '/store/orders/',
        ],
      },
    ],
    sitemap: 'https://sullysblog.com/sitemap.xml',
  }
}
