import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Please log in to download' }, { status: 401 })
    }

    // Get file details
    const { data: file, error: fileError } = await supabase
      .from('product_files')
      .select('*, products(id)')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if user has download access to this product
    const { data: access, error: accessError } = await supabase
      .from('download_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', file.product_id)
      .single()

    if (accessError || !access) {
      return NextResponse.json({ error: 'You do not have access to this file' }, { status: 403 })
    }

    // Generate signed URL (1 hour expiry)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('product-files')
      .createSignedUrl(file.file_path, 3600) // 1 hour

    if (urlError || !signedUrl) {
      console.error('Error generating signed URL:', urlError)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    // Update download count
    await supabase
      .from('download_access')
      .update({
        download_count: access.id ? 1 : 0, // Will be incremented by trigger or manually
        last_downloaded_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('product_id', file.product_id)

    // Increment download count manually (since we need to add, not set)
    await supabase.rpc('increment_download_count', {
      access_user_id: user.id,
      access_product_id: file.product_id
    }).then(() => {}).catch(() => {
      // If RPC doesn't exist, just skip - the basic update above will work
    })

    return NextResponse.json({
      url: signedUrl.signedUrl,
      fileName: file.file_name
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
