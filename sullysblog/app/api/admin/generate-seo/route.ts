import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSeoContent } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add ANTHROPIC_API_KEY to environment variables.' },
        { status: 500 }
      )
    }

    // Generate SEO content
    const seoContent = await generateSeoContent(title, content)

    return NextResponse.json(seoContent)
  } catch (error: any) {
    console.error('Error generating SEO:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate SEO content' },
      { status: 500 }
    )
  }
}
