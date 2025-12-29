type ArticleJsonLdProps = {
  title: string
  description: string
  url: string
  imageUrl?: string
  datePublished: string
  dateModified: string
  authorName: string
  categoryName?: string
}

export function ArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  categoryName,
}: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    url: url,
    image: imageUrl || 'https://sullysblog.com/logo.png',
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://sullysblog.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SullysBlog.com',
      url: 'https://sullysblog.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sullysblog.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(categoryName && {
      articleSection: categoryName,
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SullysBlog.com',
    description: 'Domain investing tips, strategies, and industry news',
    url: 'https://sullysblog.com',
    publisher: {
      '@type': 'Organization',
      name: 'SullysBlog.com',
      url: 'https://sullysblog.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sullysblog.com/logo.png',
      },
      sameAs: [
        'https://x.com/Sullys_Blog',
        'https://www.linkedin.com/in/mike-sullivan-7a1204396/',
      ],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://sullysblog.com/blog?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

type BreadcrumbItem = {
  name: string
  url: string
}

type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

type ProductJsonLdProps = {
  name: string
  description: string
  url: string
  imageUrl?: string
  price: number
  currency?: string
}

export function ProductJsonLd({
  name,
  description,
  url,
  imageUrl,
  price,
  currency = 'USD',
}: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: description,
    url: url,
    image: imageUrl || 'https://sullysblog.com/logo.png',
    brand: {
      '@type': 'Organization',
      name: 'SullysBlog.com',
    },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

type DefinedTermJsonLdProps = {
  term: string
  definition: string
  url: string
}

export function DefinedTermJsonLd({
  term,
  definition,
  url,
}: DefinedTermJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term,
    description: definition,
    url: url,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Domain Name Dictionary',
      url: 'https://sullysblog.com/domain-name-dictionary',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

type DictionaryItem = {
  term: string
  slug: string
  definition: string
}

type DictionaryCollectionJsonLdProps = {
  terms: DictionaryItem[]
}

export function DictionaryCollectionJsonLd({ terms }: DictionaryCollectionJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Domain Name Dictionary',
    description: 'A comprehensive glossary of domain investing terms, definitions, and industry jargon for domain name investors.',
    url: 'https://sullysblog.com/domain-name-dictionary',
    publisher: {
      '@type': 'Organization',
      name: 'SullysBlog.com',
      url: 'https://sullysblog.com',
    },
    hasDefinedTerm: terms.map(item => ({
      '@type': 'DefinedTerm',
      name: item.term,
      description: item.definition,
      url: `https://sullysblog.com/domain-name-dictionary/${item.slug}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
