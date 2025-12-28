import { createClient } from '@/lib/supabase/server'

export type DomainForSale = {
  id: string
  domain_name: string
  price: number
  notes: string | null  // description
  paypal_link: string | null  // external buy link
  image_url: string | null  // 50x50 icon
  is_active: boolean
  is_highlighted: boolean  // featured
  created_at: string
  updated_at: string
}

export async function getActiveDomains(): Promise<DomainForSale[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('domains_for_sale')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching domains:', error)
    return []
  }

  return data || []
}

export async function getFeaturedDomains(limit = 5): Promise<DomainForSale[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('domains_for_sale')
    .select('*')
    .eq('is_active', true)
    .eq('is_highlighted', true)
    .order('price', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured domains:', error)
    return []
  }

  return data || []
}

export async function getAllDomains(): Promise<DomainForSale[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('domains_for_sale')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all domains:', error)
    return []
  }

  return data || []
}

export async function getDomainById(id: string): Promise<DomainForSale | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('domains_for_sale')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching domain:', error)
    return null
  }

  return data
}
