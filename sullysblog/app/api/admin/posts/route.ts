import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      featured_image_url,
      category_ids,
      status,
      published_at,
      meta_title,
      meta_description,
      meta_keywords
    } = body

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    // Check for duplicate slug
    const { data: existingPost } = await adminClient
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Get the default author_id from existing posts (for single-author blog)
    const { data: existingAuthor } = await adminClient
      .from('posts')
      .select('author_id')
      .limit(1)
      .single()

    const authorId = existingAuthor?.author_id

    if (!authorId) {
      return NextResponse.json(
        { error: 'No author found. Please create an author first.' },
        { status: 400 }
      )
    }

    // Create the post
    const { data: post, error: createError } = await adminClient
      .from('posts')
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        featured_image_url: featured_image_url || null,
        category_id: null, // Legacy field - we use junction table now
        status: status || 'draft',
        published_at: published_at || null,
        seo_title: meta_title || null,
        seo_description: meta_description || null,
        seo_keywords: meta_keywords || null,
        author_id: authorId
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating post:', createError)
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    // Save categories to junction table
    if (category_ids && category_ids.length > 0) {
      const categoryLinks = category_ids.map((categoryId: string) => ({
        post_id: post.id,
        category_id: categoryId
      }))

      const { error: categoryError } = await adminClient
        .from('post_categories')
        .insert(categoryLinks)

      if (categoryError) {
        console.error('Error saving categories:', categoryError)
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Error in POST /api/admin/posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
