import { NextResponse } from 'next/server'
import { isStoreVisible } from '@/lib/queries/settings'

export async function GET() {
  try {
    const visible = await isStoreVisible()
    return NextResponse.json({ visible })
  } catch (error) {
    console.error('Error fetching store visibility:', error)
    // Default to visible on error
    return NextResponse.json({ visible: true })
  }
}
