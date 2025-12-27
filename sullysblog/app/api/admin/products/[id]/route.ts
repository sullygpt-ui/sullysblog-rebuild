import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get single product
export async function GET(
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

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get files
    const { data: files } = await supabase
      .from('product_files')
      .select('*')
      .eq('product_id', id)
      .order('display_order', { ascending: true })

    // Get bundle items if bundle
    let bundleItems: string[] = []
    if (product.product_type === 'bundle') {
      const { data: items } = await supabase
        .from('bundle_items')
        .select('included_product_id')
        .eq('bundle_product_id', id)
        .order('display_order', { ascending: true })

      bundleItems = items?.map(i => i.included_product_id) || []
    }

    return NextResponse.json({
      ...product,
      files: files || [],
      bundle_items: bundleItems
    })
  } catch (error) {
    console.error('Error in GET /api/admin/products/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update product
export async function PUT(
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

    const body = await request.json()

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update({
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
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update product files - delete existing and re-add
    if (body.files !== undefined) {
      await supabase
        .from('product_files')
        .delete()
        .eq('product_id', id)

      if (body.files && body.files.length > 0) {
        const filesData = body.files.map((file: any, index: number) => ({
          product_id: id,
          file_name: file.file_name,
          file_path: file.file_path,
          file_size: file.file_size || null,
          file_type: file.file_type || null,
          display_order: index
        }))

        await supabase.from('product_files').insert(filesData)
      }
    }

    // Update bundle items if bundle
    if (body.product_type === 'bundle') {
      await supabase
        .from('bundle_items')
        .delete()
        .eq('bundle_product_id', id)

      if (body.bundle_items && body.bundle_items.length > 0) {
        const bundleData = body.bundle_items.map((itemId: string, index: number) => ({
          bundle_product_id: id,
          included_product_id: itemId,
          display_order: index
        }))

        await supabase.from('bundle_items').insert(bundleData)
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error in PUT /api/admin/products/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete product (or archive if has orders)
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

    // Check if product has any orders
    const { count } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', id)

    if (count && count > 0) {
      // Product has orders - archive instead of delete
      const { error: archiveError } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', id)

      if (archiveError) {
        console.error('Error archiving product:', archiveError)
        return NextResponse.json({ error: archiveError.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        archived: true,
        message: 'Product has orders and was archived instead of deleted'
      })
    }

    // No orders - safe to delete
    // Files and bundle items will be cascade deleted
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/products/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
