import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

type DictionaryTerm = Database['public']['Tables']['dictionary_terms']['Row']

export async function getAllTerms(): Promise<DictionaryTerm[]> {
  const supabase = await createClient()

  const { data: terms, error } = await supabase
    .from('dictionary_terms')
    .select('*')
    .order('term', { ascending: true })

  if (error || !terms) {
    return []
  }

  return terms
}

export async function getTermBySlug(slug: string): Promise<DictionaryTerm | null> {
  const supabase = await createClient()

  const { data: term, error } = await supabase
    .from('dictionary_terms')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !term) {
    return null
  }

  return term
}

export async function getTermsByLetter(letter: string): Promise<DictionaryTerm[]> {
  const supabase = await createClient()

  const { data: terms, error } = await supabase
    .from('dictionary_terms')
    .select('*')
    .ilike('term', `${letter}%`)
    .order('term', { ascending: true })

  if (error || !terms) {
    return []
  }

  return terms
}

export function groupTermsByLetter(terms: DictionaryTerm[]): Record<string, DictionaryTerm[]> {
  const grouped: Record<string, DictionaryTerm[]> = {}

  terms.forEach(termRow => {
    const firstLetter = termRow.term.charAt(0).toUpperCase()
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = []
    }
    grouped[firstLetter].push(termRow)
  })

  return grouped
}
