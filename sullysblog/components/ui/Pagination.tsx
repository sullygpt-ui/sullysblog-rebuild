import Link from 'next/link'

type PaginationProps = {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const getPageUrl = (page: number) => {
    if (page === 1) {
      return basePath
    }
    return `${basePath}?page=${page}`
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 7 // Show 7 page numbers at a time

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page, last page, current page, and nearby pages
      if (currentPage <= 3) {
        // Near beginning
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push(-1) // Ellipsis
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1)
        pages.push(-1) // Ellipsis
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        // Middle
        pages.push(1)
        pages.push(-1) // Ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push(-2) // Ellipsis
        pages.push(totalPages)
      }
    }

    return pages.map((page, index) => {
      if (page === -1 || page === -2) {
        return (
          <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-400">
            ...
          </span>
        )
      }

      const isActive = page === currentPage

      return (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`
            px-4 py-2 rounded-lg border transition-colors
            ${isActive
              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-400'
            }
          `}
          aria-current={isActive ? 'page' : undefined}
        >
          {page}
        </Link>
      )
    })
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-400 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </span>
      )}

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center gap-2">
        {renderPageNumbers()}
      </div>

      {/* Mobile: Just show current/total */}
      <div className="sm:hidden px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-400 transition-colors flex items-center gap-2"
        >
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2">
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  )
}
