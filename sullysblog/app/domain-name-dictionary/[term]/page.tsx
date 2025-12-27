import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTermBySlug, getAllTerms } from '@/lib/queries/dictionary'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'

type Props = {
  params: Promise<{ term: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: slug } = await params
  const term = await getTermBySlug(slug)

  if (!term) {
    return {
      title: 'Term Not Found',
      description: 'The requested dictionary term could not be found'
    }
  }

  const title = `${term.term} - Domain Name Dictionary | SullysBlog.com`
  const description = term.short_definition || term.full_definition?.substring(0, 160) || `Learn about ${term.term} in domain investing`

  return {
    title,
    description,
    openGraph: {
      title: `${term.term} - Domain Dictionary`,
      description,
      url: `https://sullysblog.com/domain-name-dictionary/${term.slug}`,
      type: 'article'
    },
    twitter: {
      card: 'summary',
      title: `${term.term} - Domain Dictionary`,
      description
    },
    alternates: {
      canonical: `https://sullysblog.com/domain-name-dictionary/${term.slug}`
    },
    keywords: `${term.term}, domain dictionary, domain terms, domain investing`
  }
}

export default async function TermPage({ params }: Props) {
  const { term: slug } = await params
  const term = await getTermBySlug(slug)

  if (!term) {
    notFound()
  }

  // Get all terms for "Browse More Terms" section
  const allTerms = await getAllTerms()
  const randomTerms = allTerms
    .filter(t => t.id !== term.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <Link href="/domain-name-dictionary" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Dictionary
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-gray-900 dark:text-gray-100 font-medium">
                {term.term}
              </li>
            </ol>
          </nav>

          {/* Term Content */}
          <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-12">
            {/* Term Name */}
            <header className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {term.term}
              </h1>
            </header>

            {/* Full Definition */}
            {term.full_definition && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: term.full_definition }}
                  className="text-gray-700 dark:text-gray-300 leading-relaxed"
                />
              </div>
            )}

            {/* No full definition fallback */}
            {!term.full_definition && !term.short_definition && (
              <p className="text-gray-600 dark:text-gray-400 italic">
                Definition coming soon...
              </p>
            )}
          </article>

          {/* Back to Dictionary */}
          <div className="mb-8">
            <Link
              href="/domain-name-dictionary"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dictionary
            </Link>
          </div>

          {/* Browse More Terms */}
          {randomTerms.length > 0 && (
            <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Browse More Terms
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {randomTerms.map(randomTerm => (
                  <Link
                    key={randomTerm.id}
                    href={`/domain-name-dictionary/${randomTerm.slug}`}
                    className="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {randomTerm.term}
                    </h3>
                    {randomTerm.short_definition && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {randomTerm.short_definition}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <StickySidebar>
            <Sidebar />
          </StickySidebar>
        </div>
      </div>
    </div>
  )
}
