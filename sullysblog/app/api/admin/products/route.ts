import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        slug: body.slug,
        short_description: body.short_description || null,
        description: body.description || null,
        price: body.price || 0,
        compare_at_price: body.compare_at_price || null,
        product_type: body.product_type,
        cover_image_url: body.cover_image_url || null,
        featured: body.featured || false,
        display_order: body.display_order || 999,
        status: body.status || 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Add product files if provided
    if (body.files && body.files.length > 0) {
      const filesData = body.files.map((file: any, index: number) => ({
        product_id: product.id,
        file_name: file.file_name,
        file_path: file.file_path,
        file_size: file.file_size || null,
        file_type: file.file_type || null,
        display_order: index
      }))

      const { error: filesError } = await supabase
        .from('product_files')
        .insert(filesData)

      if (filesError) {
        console.error('Error adding product files:', filesError)
      }
    }

    // Add bundle items if this is a bundle
    if (body.product_type === 'bundle' && body.bundle_items && body.bundle_items.length > 0) {
      const bundleData = body.bundle_items.map((itemId: string, index: number) => ({
        bundle_product_id: product.id,
        included_product_id: itemId,
        display_order: index
      }))

      const { error: bundleError } = await supabase
        .from('bundle_items')
        .insert(bundleData)

      if (bundleError) {
        console.error('Error adding bundle items:', bundleError)
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error in POST /api/admin/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - List all products (admin)
export async function GET() {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/admin/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
