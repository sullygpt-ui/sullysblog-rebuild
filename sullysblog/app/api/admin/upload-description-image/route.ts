import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import sharp from 'sharp'

// Description images - fit within content area
const MAX_IMAGE_WIDTH = 800
const MAX_IMAGE_HEIGHT = 800

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Resize image to fit within max dimensions while maintaining aspect ratio
    let processedBuffer: Buffer
    let outputFormat: 'jpeg' | 'png' | 'webp' = 'jpeg'
    let contentType = 'image/jpeg'

    // Determine output format based on input
    if (file.type === 'image/png') {
      outputFormat = 'png'
      contentType = 'image/png'
    } else if (file.type === 'image/webp') {
      outputFormat = 'webp'
      contentType = 'image/webp'
    }

    // Resize image - fit within dimensions, maintaining aspect ratio
    processedBuffer = await sharp(inputBuffer)
      .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat(outputFormat, { quality: 85 })
      .toBuffer()

    // Generate unique filename with correct extension
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = `description-${timestamp}-${randomId}.${ext}`

    // Upload to Supabase storage using admin client
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.storage
      .from('product-images')
      .upload(`descriptions/${fileName}`, processedBuffer, {
        contentType,
        cacheControl: '31536000', // 1 year cache
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from('product-images')
      .getPublicUrl(`descriptions/${fileName}`)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName
    })
  } catch (error) {
    console.error('Error uploading description image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
