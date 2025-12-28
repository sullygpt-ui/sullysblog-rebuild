import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Purchase Complete - SullysBlog.com',
}

type Props = {
  searchParams: Promise<{ session_id?: string; domain?: string }>
}

export default async function DomainPurchaseSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const domainName = params.domain ? decodeURIComponent(params.domain) : 'your domain'

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Purchase Complete!
      </h1>

      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
        Thank you for purchasing <strong className="text-gray-900 dark:text-white">{domainName}</strong>
      </p>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 text-left">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What happens next?
        </h2>
        <ol className="space-y-3 text-gray-600 dark:text-gray-300">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>You'll receive a confirmation email with your receipt</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>I'll contact you within 24 hours to begin the domain transfer</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span>The domain will be transferred to your registrar account</span>
          </li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/domains-for-sale"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Browse More Domains
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Return Home
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Questions? <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact me</a>
      </p>
    </div>
  )
}
