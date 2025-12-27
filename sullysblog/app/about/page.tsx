import { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { StickySidebar } from '@/components/layout/StickySidebar'

export const metadata: Metadata = {
  title: 'About - SullysBlog.com',
  description: 'Learn about Sully (Mike Sullivan), a seasoned technology-focused entrepreneur, program management consultant, and writer.',
  openGraph: {
    title: 'About - SullysBlog.com',
    description: 'Learn about Sully (Mike Sullivan), a seasoned technology-focused entrepreneur, program management consultant, and writer.',
    url: 'https://sullysblog.com/about',
    type: 'website'
  },
  alternates: {
    canonical: 'https://sullysblog.com/about'
  }
}

export default async function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
              <strong>Sully (Mike Sullivan)</strong> is a seasoned technology-focused entrepreneur, program management consultant, and writer.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Background</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              With over 25 years in program management and technology implementation, Sully holds PMP certification and specializes in cloud-based SaaS models.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Professional Ventures</h2>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>SullyMedia.com</strong> (Infinite Designs, Inc.) - His website development and online marketing business helping companies establish their digital presence.
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              <strong>SullysBlog.com</strong> - A domain investment and online business blog with a loyal following among digital entrepreneurs.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Media & Speaking</h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>Host of the podcast "I Used to This," exploring popular television from the 1970s-80s</li>
              <li>Founding member of Magnetar Media and MO.com, conducting hundreds of interviews with business founders and executives</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Published Work</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Sully authored a book examining the domain name industry, providing comprehensive insights into this specialized field.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Contact</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Email: <a href="mailto:Mike@SullysBlog.com" className="text-blue-600 dark:text-blue-400 hover:underline">Mike@SullysBlog.com</a>
            </p>
          </div>
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
