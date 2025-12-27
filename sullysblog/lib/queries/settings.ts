import { createClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

export type SiteSetting = {
  key: string
  value: boolean | string | number | object
  updated_at: string
}

export async function getSetting(key: string): Promise<boolean | string | number | object | null> {
  noStore()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) {
    console.error('Error fetching setting:', error)
    return null
  }

  return data.value
}

export async function isStoreVisible(): Promise<boolean> {
  const value = await getSetting('store_visible')
  // Default to true if setting doesn't exist
  return value !== false
}
