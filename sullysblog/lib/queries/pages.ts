import { createAdminClient } from '@/lib/supabase/admin'

export type Page = {
  id: string
  slug: string
  title: string
  content: string | null
  meta_description: string | null
  updated_at: string
  created_at: string
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data as Page
}

export async function getAllPages(): Promise<Page[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('title')

  if (error || !data) {
    return []
  }

  return data as Page[]
}
