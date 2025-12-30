import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    // Check for duplicate slug (excluding current post)
    const { data: existingPost } = await adminClient
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Update the post
    const { data: post, error: updateError } = await adminClient
      .from('posts')
      .update({
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
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating post:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Update categories in junction table
    // First, delete existing category links
    await adminClient
      .from('post_categories')
      .delete()
      .eq('post_id', id)

    // Then, insert new category links
    if (category_ids && category_ids.length > 0) {
      const categoryLinks = category_ids.map((categoryId: string) => ({
        post_id: id,
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
    console.error('Error in PUT /api/admin/posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client for database operations
    const adminClient = createAdminClient()

    // Delete the post (post_categories will be deleted via CASCADE)
    const { error } = await adminClient
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting post:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/posts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
