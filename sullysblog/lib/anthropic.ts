import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type SeoContent = {
  meta_title: string
  meta_description: string
  meta_keywords: string
}

/**
 * Generate SEO metadata for a blog post using Claude
 */
export async function generateSeoContent(title: string, content: string): Promise<SeoContent> {
  // Strip HTML tags from content for better analysis
  const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  // Truncate content if too long (keep first ~3000 chars)
  const truncatedContent = plainContent.length > 3000
    ? plainContent.substring(0, 3000) + '...'
    : plainContent

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `You are an SEO expert. Generate SEO metadata for this blog post.

Title: ${title}

Content: ${truncatedContent}

Generate the following in JSON format:
1. meta_title: A compelling SEO title (50-60 characters max). Should include the primary keyword.
2. meta_description: A compelling meta description (150-160 characters max). Should summarize the content and include a subtle call-to-action.
3. meta_keywords: 5-8 relevant keywords, comma-separated. Include the primary topic and related terms.

Respond ONLY with valid JSON in this exact format:
{"meta_title": "...", "meta_description": "...", "meta_keywords": "..."}

Do not include any other text or explanation.`
      }
    ]
  })

  // Extract text from response
  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON response
  try {
    const result = JSON.parse(responseText.trim())
    return {
      meta_title: result.meta_title || '',
      meta_description: result.meta_description || '',
      meta_keywords: result.meta_keywords || ''
    }
  } catch (error) {
    console.error('Failed to parse AI response:', responseText)
    throw new Error('Failed to parse AI-generated SEO content')
  }
}
