import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Fetch recent published posts with categories
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50) // Last 50 posts

  if (!posts) {
    return new NextResponse('Error fetching posts', { status: 500 })
  }

  // Fetch categories for posts
  const postsWithCategories = await Promise.all(
    posts.map(async (post) => {
      let category = null
      if (post.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', post.category_id)
          .single()
        category = categoryData
      }
      return { ...post, category }
    })
  )

  // Generate RSS XML
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SullysBlog.com - Domain Investing Tips and News</title>
    <link>https://sullysblog.com</link>
    <description>Domain investing, keyword premium domain names, domain tips, selling domains, generic domains</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://sullysblog.com/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js</generator>
    <managingEditor>michael@sullysblog.com (Michael Sullivan)</managingEditor>
    <webMaster>michael@sullysblog.com (Michael Sullivan)</webMaster>
    <image>
      <url>https://sullysblog.com/logo.png</url>
      <title>SullysBlog.com</title>
      <link>https://sullysblog.com</link>
    </image>
${postsWithCategories.map(post => {
  // Escape XML special characters
  const escapeXml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const title = escapeXml(post.title)
  const link = `https://sullysblog.com/${post.slug}`
  const description = post.excerpt ? escapeXml(post.excerpt) : escapeXml(post.title)
  const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString()
  const category = post.category?.name ? escapeXml(post.category.name) : 'Uncategorized'

  // Clean content for CDATA
  const content = post.content || ''

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>Michael Sullivan</dc:creator>
      <category>${category}</category>
    </item>`
}).join('\n')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
