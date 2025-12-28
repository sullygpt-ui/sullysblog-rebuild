import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Get the category filter from query params (default to "domains")
  const searchParams = request.nextUrl.searchParams
  const categorySlug = searchParams.get('cat') || 'domains'

  // Get the category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', categorySlug)
    .single()

  if (!category) {
    return new NextResponse('Category not found', { status: 404 })
  }

  // Fetch posts in this category
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })
    .limit(50)

  if (!posts) {
    return new NextResponse('Error fetching posts', { status: 500 })
  }

  // Escape XML special characters
  const escapeXml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // Generate RSS XML
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SullysBlog.com - ${escapeXml(category.name)}</title>
    <link>https://sullysblog.com/category/${category.slug}</link>
    <description>Domain investing articles in the ${escapeXml(category.name)} category from SullysBlog.com</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://sullysblog.com/?feed=rss2" rel="self" type="application/rss+xml"/>
    <generator>Next.js</generator>
    <managingEditor>michael@sullysblog.com (Michael Sullivan)</managingEditor>
    <webMaster>michael@sullysblog.com (Michael Sullivan)</webMaster>
    <image>
      <url>https://sullysblog.com/logo.png</url>
      <title>SullysBlog.com</title>
      <link>https://sullysblog.com</link>
    </image>
${posts.map(post => {
  const title = escapeXml(post.title)
  const link = `https://sullysblog.com/${post.slug}`
  const description = post.excerpt ? escapeXml(post.excerpt) : escapeXml(post.title)
  const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString()
  const content = post.content || ''

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>Michael Sullivan</dc:creator>
      <category>${escapeXml(category.name)}</category>
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
