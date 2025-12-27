import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DictionaryPage() {
  const supabase = await createClient()

  // Fetch all dictionary terms
  const { data: terms } = await supabase
    .from('dictionary_terms')
    .select('*')
    .order('term')

  // Group by first letter
  const termsByLetter = (terms || []).reduce((acc, term) => {
    const firstLetter = term.term.charAt(0).toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(term)
    return acc
  }, {} as Record<string, typeof terms>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dictionary</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage domain investing dictionary terms
          </p>
        </div>
        <Link
          href="/admin/dictionary/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Term
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Terms</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {terms?.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Letters Covered</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {Object.keys(termsByLetter).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average per Letter</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {Object.keys(termsByLetter).length > 0
              ? Math.round((terms?.length || 0) / Object.keys(termsByLetter).length)
              : 0
            }
          </p>
        </div>
      </div>

      {/* Terms List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short Definition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {terms?.map((term) => (
                <tr key={term.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {term.term}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md">
                      {term.short_definition || 'No short definition'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                      {term.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3">
                    <Link
                      href={`/domain-name-dictionary/${term.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/dictionary/${term.id}`}
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Letter Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribution by Letter</h2>
        <div className="grid grid-cols-6 md:grid-cols-13 gap-2">
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
            <div
              key={letter}
              className={`text-center p-2 rounded ${
                termsByLetter[letter]
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              <div className="font-bold">{letter}</div>
              <div className="text-xs">{termsByLetter[letter]?.length || 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
