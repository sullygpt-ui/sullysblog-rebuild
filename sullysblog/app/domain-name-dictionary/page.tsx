import { Metadata } from 'next'
import Link from 'next/link'
import { getAllTerms, groupTermsByLetter } from '@/lib/queries/dictionary'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'
import { DictionaryCollectionJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Domain Name Dictionary - Complete Glossary of Domain Investing Terms | SullysBlog.com',
  description: 'Comprehensive dictionary of domain investing terminology. Learn the language of domain names, from aftermarket to zones.',
  openGraph: {
    title: 'Domain Name Dictionary - SullysBlog.com',
    description: 'Complete glossary of domain investing terms and definitions',
    url: 'https://sullysblog.com/domain-name-dictionary',
    type: 'website'
  },
  alternates: {
    canonical: 'https://sullysblog.com/domain-name-dictionary'
  },
  keywords: 'domain dictionary, domain terms, domain glossary, domain investing terminology, domain name definitions'
}

export default async function DictionaryPage() {
  const terms = await getAllTerms()
  const groupedTerms = groupTermsByLetter(terms)
  const letters = Object.keys(groupedTerms).sort()

  // Prepare terms for schema markup
  const schemaTerms = terms.map(t => ({
    term: t.term,
    slug: t.slug,
    definition: (t.short_definition || '').substring(0, 200),
  }))

  return (
    <>
      {/* Schema Markup */}
      <DictionaryCollectionJsonLd terms={schemaTerms} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://sullysblog.com' },
          { name: 'Dictionary', url: 'https://sullysblog.com/domain-name-dictionary' },
        ]}
      />

      <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Page Header */}
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Domain Name Dictionary
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              A comprehensive glossary of domain investing terms and definitions.
              Learn the language of domain names from A to Z.
            </p>
          </header>

          {/* Letter Navigation */}
          <nav className="mb-8 sticky top-0 bg-white dark:bg-gray-900 z-10 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 justify-center">
              {letters.map(letter => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                >
                  {letter}
                </a>
              ))}
            </div>
          </nav>

          {/* Terms by Letter */}
          <div className="space-y-12">
            {letters.map(letter => (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-20">
                {/* Letter Header */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-2 border-b-2 border-blue-500">
                  {letter}
                </h2>

                {/* Terms Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {groupedTerms[letter].map(term => (
                    <Link
                      key={term.id}
                      href={`/domain-name-dictionary/${term.slug}`}
                      className="group p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Term Name */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {term.term}
                      </h3>

                      {/* Short Definition */}
                      {term.short_definition && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {term.short_definition}
                        </p>
                      )}

                      {/* Read More Arrow */}
                      <div className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Read more
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Empty State */}
          {terms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No dictionary terms found. Check back soon!
              </p>
            </div>
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
    </>
  )
}
