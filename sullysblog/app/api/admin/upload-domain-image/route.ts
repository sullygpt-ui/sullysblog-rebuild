import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get file buffer (already cropped to 50x50 on client)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `domain-${timestamp}.png`

    // Upload to Supabase Storage
    const adminClient = createAdminClient()
    const { error: uploadError } = await adminClient.storage
      .from('product-images')
      .upload(`domains/${fileName}`, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('product-images')
      .getPublicUrl(`domains/${fileName}`)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Error uploading domain image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
